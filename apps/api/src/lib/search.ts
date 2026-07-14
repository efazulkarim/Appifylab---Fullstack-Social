import { Meilisearch } from "meilisearch";
import { env } from "./env.js";

let client: Meilisearch | null = null;
let indexInitialized = false;

if (env.MEILISEARCH_HOST) {
  try {
    client = new Meilisearch({
      host: env.MEILISEARCH_HOST,
      apiKey: env.MEILISEARCH_API_KEY || undefined,
    });
    console.log("Search Engine: Meilisearch client initialized.");
  } catch (err) {
    console.error("Failed to initialize Meilisearch client:", err);
  }
} else {
  console.log("Search Engine: Meilisearch not configured. Falling back to DB search.");
}

async function ensureIndex() {
  if (!client) return null;
  if (indexInitialized) return client.index("users");
  
  try {
    const index = client.index("users");
    await index.updateSettings({
      searchableAttributes: ["firstName", "lastName", "email"],
    });
    indexInitialized = true;
    return index;
  } catch (err) {
    console.error("Failed to configure Meilisearch index:", err);
    return null;
  }
}

export async function indexUser(user: { id: string; firstName: string; lastName: string; email: string }) {
  const index = await ensureIndex();
  if (!index) return;
  
  try {
    await index.addDocuments([user]);
  } catch (err) {
    console.error("Failed to index user in Meilisearch:", err);
  }
}

export async function searchUsersInIndex(query: string, limit: number = 10): Promise<string[] | null> {
  const index = await ensureIndex();
  if (!index) return null;
  
  try {
    const response = await index.search(query, { limit });
    return response.hits.map((hit: any) => hit.id);
  } catch (err) {
    console.error("Meilisearch search failed, falling back to DB:", err);
    return null;
  }
}
