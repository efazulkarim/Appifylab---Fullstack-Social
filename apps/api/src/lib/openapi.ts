export const openApiSpec = {
  openapi: "3.0.0",
  info: {
    title: "Appifylab Fullstack Social API",
    version: "1.0.0",
    description: "API documentation for the Appifylab Fullstack Social application. Note that unsafe methods (POST, PUT, DELETE, PATCH) require CSRF validation via the `x-csrf-token` header and standard cookies.",
  },
  servers: [
    {
      url: "http://localhost:8080",
      description: "Local development server",
    },
  ],
  security: [
    {
      cookieAuth: [],
    },
  ],
  paths: {
    "/api/auth/csrf": {
      get: {
        tags: ["Authentication"],
        summary: "Get CSRF Token",
        description: "Issues a double-submit CSRF token. Sets the `csrf_token` cookie and returns the token value in the response body.",
        responses: {
          200: {
            description: "CSRF token issued successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: {
                      type: "object",
                      properties: {
                        csrfToken: { type: "string" }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/api/auth/register": {
      post: {
        tags: ["Authentication"],
        summary: "Register new user",
        description: "Registers a new user, sets authentication session cookies, and returns the registered user profile.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/RegisterInput"
              }
            }
          }
        },
        responses: {
          201: {
            description: "User registered successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: {
                      $ref: "#/components/schemas/UserDto"
                    }
                  }
                }
              }
            }
          },
          400: {
            description: "Validation error or invalid input data",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ApiError"
                }
              }
            }
          }
        }
      }
    },
    "/api/auth/login": {
      post: {
        tags: ["Authentication"],
        summary: "Login",
        description: "Authenticates user credentials, sets authentication session cookies, and returns the logged-in user profile.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/LoginInput"
              }
            }
          }
        },
        responses: {
          200: {
            description: "Authenticated successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: {
                      $ref: "#/components/schemas/UserDto"
                    }
                  }
                }
              }
            }
          },
          400: {
            description: "Validation error or invalid inputs",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ApiError"
                }
              }
            }
          },
          401: {
            description: "Invalid credentials",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ApiError"
                }
              }
            }
          }
        }
      }
    },
    "/api/auth/google": {
      get: {
        tags: ["Authentication"],
        summary: "Google OAuth Redirect",
        description: "Redirects the client to Google's authentication page.",
        responses: {
          302: {
            description: "Redirect to Google OAuth consent page"
          }
        }
      }
    },
    "/api/auth/google/callback": {
      get: {
        tags: ["Authentication"],
        summary: "Google OAuth Callback",
        description: "Processes Google OAuth code, signs in the user, sets authentication session cookies, and redirects to client dashboard.",
        parameters: [
          {
            name: "code",
            in: "query",
            required: true,
            schema: { type: "string" },
            description: "Authorization code returned by Google OAuth."
          }
        ],
        responses: {
          302: {
            description: "Redirect to client feed or failure page"
          },
          400: {
            description: "Missing or invalid code",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ApiError"
                }
              }
            }
          }
        }
      }
    },
    "/api/auth/refresh": {
      post: {
        tags: ["Authentication"],
        summary: "Refresh Session",
        description: "Refreshes session tokens using the `refresh_token` cookie and returns updated user profile.",
        responses: {
          200: {
            description: "Tokens refreshed successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: {
                      $ref: "#/components/schemas/UserDto"
                    }
                  }
                }
              }
            }
          },
          401: {
            description: "Missing or invalid refresh token",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ApiError"
                }
              }
            }
          }
        }
      }
    },
    "/api/auth/logout": {
      post: {
        tags: ["Authentication"],
        summary: "Logout",
        description: "Clears session cookies and revokes refresh token.",
        responses: {
          200: {
            description: "Logged out successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: {
                      type: "object",
                      properties: {
                        success: { type: "boolean" }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/api/auth/me": {
      get: {
        tags: ["Authentication"],
        summary: "Get current user profile",
        description: "Returns profile info of the currently logged in user based on access token cookie.",
        responses: {
          200: {
            description: "Profile returned successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: {
                      $ref: "#/components/schemas/UserDto"
                    }
                  }
                }
              }
            }
          },
          401: {
            description: "Unauthenticated",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ApiError"
                }
              }
            }
          }
        }
      }
    },
    "/api/feed": {
      get: {
        tags: ["Posts"],
        summary: "Get Feed Posts",
        description: "Retrieves a paginated list of posts for the logged-in user (newest first). Supports cursor-based pagination.",
        parameters: [
          {
            name: "cursor",
            in: "query",
            required: false,
            schema: { type: "string" },
            description: "Pagination cursor (the ID of the last retrieved post)."
          },
          {
            name: "limit",
            in: "query",
            required: false,
            schema: { type: "integer", minimum: 1, maximum: 50, default: 10 },
            description: "Number of posts to fetch."
          }
        ],
        responses: {
          200: {
            description: "Feed posts list",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: {
                      type: "array",
                      items: {
                        $ref: "#/components/schemas/PostDto"
                      }
                    },
                    pageInfo: {
                      type: "object",
                      properties: {
                        nextCursor: { type: "string", nullable: true }
                      }
                    }
                  }
                }
              }
            }
          },
          401: {
            description: "Unauthenticated",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ApiError"
                }
              }
            }
          }
        }
      }
    },
    "/api/posts": {
      post: {
        tags: ["Posts"],
        summary: "Create Post",
        description: "Creates a new post with text and optional image.",
        security: [
          {
            cookieAuth: [],
            csrfHeader: []
          }
        ],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                required: ["text"],
                properties: {
                  text: { type: "string", description: "Text content of the post", maxLength: 5000 },
                  visibility: { type: "string", enum: ["PUBLIC", "PRIVATE"], default: "PUBLIC" },
                  image: { type: "string", format: "binary", description: "Optional image file (max 5MB)" }
                }
              }
            }
          }
        },
        responses: {
          201: {
            description: "Post created successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: {
                      $ref: "#/components/schemas/PostDto"
                    }
                  }
                }
              }
            }
          },
          400: {
            description: "Validation error or file size limit exceeded",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ApiError"
                }
              }
            }
          },
          401: {
            description: "Unauthenticated",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ApiError"
                }
              }
            }
          }
        }
      }
    },
    "/api/posts/{postId}/like": {
      put: {
        tags: ["Posts"],
        summary: "Like Post",
        description: "Likes a post and notifies the author.",
        security: [
          {
            cookieAuth: [],
            csrfHeader: []
          }
        ],
        parameters: [
          {
            name: "postId",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "ID of the post to like."
          }
        ],
        responses: {
          200: {
            description: "Post liked successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: {
                      type: "object",
                      properties: {
                        liked: { type: "boolean", example: true }
                      }
                    }
                  }
                }
              }
            }
          },
          404: {
            description: "Post not found",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ApiError"
                }
              }
            }
          }
        }
      },
      delete: {
        tags: ["Posts"],
        summary: "Unlike Post",
        description: "Removes a like from a post.",
        security: [
          {
            cookieAuth: [],
            csrfHeader: []
          }
        ],
        parameters: [
          {
            name: "postId",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "ID of the post to unlike."
          }
        ],
        responses: {
          200: {
            description: "Post unliked successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: {
                      type: "object",
                      properties: {
                        liked: { type: "boolean", example: false }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/api/posts/{postId}/likes": {
      get: {
        tags: ["Posts"],
        summary: "Get Post Likers",
        description: "Lists users who have liked a post.",
        parameters: [
          {
            name: "postId",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "ID of the post."
          }
        ],
        responses: {
          200: {
            description: "List of users who liked the post",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: {
                      type: "array",
                      items: {
                        $ref: "#/components/schemas/UserDto"
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/api/posts/{postId}/comments": {
      get: {
        tags: ["Comments"],
        summary: "Get Post Comments",
        description: "Retrieves all comments and nested replies for a post.",
        parameters: [
          {
            name: "postId",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "ID of the post."
          }
        ],
        responses: {
          200: {
            description: "List of comments",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: {
                      type: "array",
                      items: {
                        $ref: "#/components/schemas/CommentDto"
                      }
                    }
                  }
                }
              }
            }
          },
          404: {
            description: "Post not found",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ApiError"
                }
              }
            }
          }
        }
      },
      post: {
        tags: ["Comments"],
        summary: "Create Comment",
        description: "Adds a comment to a post and notifies the author.",
        security: [
          {
            cookieAuth: [],
            csrfHeader: []
          }
        ],
        parameters: [
          {
            name: "postId",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "ID of the post."
          }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/CreateCommentInput"
              }
            }
          }
        },
        responses: {
          201: {
            description: "Comment created successfully",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/CommentDto"
                }
              }
            }
          },
          404: {
            description: "Post not found",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ApiError"
                }
              }
            }
          }
        }
      }
    },
    "/api/comments/{commentId}/replies": {
      post: {
        tags: ["Comments"],
        summary: "Create Reply",
        description: "Replies to an existing comment.",
        security: [
          {
            cookieAuth: [],
            csrfHeader: []
          }
        ],
        parameters: [
          {
            name: "commentId",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "ID of the parent comment to reply to."
          }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/CreateCommentInput"
              }
            }
          }
        },
        responses: {
          201: {
            description: "Reply comment created successfully",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/CommentDto"
                }
              }
            }
          },
          404: {
            description: "Parent comment not found",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ApiError"
                }
              }
            }
          }
        }
      }
    },
    "/api/comments/{commentId}/like": {
      put: {
        tags: ["Comments"],
        summary: "Like Comment",
        description: "Likes a comment and notifies the author.",
        security: [
          {
            cookieAuth: [],
            csrfHeader: []
          }
        ],
        parameters: [
          {
            name: "commentId",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "ID of the comment to like."
          }
        ],
        responses: {
          200: {
            description: "Comment liked successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: {
                      type: "object",
                      properties: {
                        liked: { type: "boolean", example: true }
                      }
                    }
                  }
                }
              }
            }
          },
          404: {
            description: "Comment not found",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ApiError"
                }
              }
            }
          }
        }
      },
      delete: {
        tags: ["Comments"],
        summary: "Unlike Comment",
        description: "Unlikes a comment.",
        security: [
          {
            cookieAuth: [],
            csrfHeader: []
          }
        ],
        parameters: [
          {
            name: "commentId",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "ID of the comment to unlike."
          }
        ],
        responses: {
          200: {
            description: "Comment unliked successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: {
                      type: "object",
                      properties: {
                        liked: { type: "boolean", example: false }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/api/comments/{commentId}/likes": {
      get: {
        tags: ["Comments"],
        summary: "Get Comment Likers",
        description: "Lists users who have liked a comment.",
        parameters: [
          {
            name: "commentId",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "ID of the comment."
          }
        ],
        responses: {
          200: {
            description: "List of users who liked the comment",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: {
                      type: "array",
                      items: {
                        $ref: "#/components/schemas/UserDto"
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/api/search": {
      get: {
        tags: ["Users"],
        summary: "Search Users",
        description: "Searches users by name or email query parameter.",
        parameters: [
          {
            name: "q",
            in: "query",
            required: true,
            schema: { type: "string", minLength: 1, maxLength: 80 },
            description: "Query search term."
          }
        ],
        responses: {
          200: {
            description: "Search results",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: {
                      type: "array",
                      items: {
                        $ref: "#/components/schemas/UserDto"
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/api/sidebar": {
      get: {
        tags: ["Users"],
        summary: "Get Sidebar Data",
        description: "Retrieves data context populated in sidebar components: suggested users, friend lists, active stories, upcoming events, and recent notification objects.",
        responses: {
          200: {
            description: "Sidebar aggregation object",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: {
                      type: "object",
                      properties: {
                        suggestions: {
                          type: "array",
                          items: { $ref: "#/components/schemas/UserDto" }
                        },
                        friends: {
                          type: "array",
                          items: { $ref: "#/components/schemas/UserDto" }
                        },
                        stories: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              id: { type: "string" },
                              text: { type: "string" },
                              author: { $ref: "#/components/schemas/UserDto" },
                              createdAt: { type: "string", format: "date-time" }
                            }
                          }
                        },
                        events: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              id: { type: "string" },
                              title: { type: "string" },
                              description: { type: "string" },
                              startsAt: { type: "string", format: "date-time" }
                            }
                          }
                        },
                        notifications: {
                          type: "array",
                          items: { $ref: "#/components/schemas/NotificationDto" }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/api/users/{userId}/follow": {
      post: {
        tags: ["Users"],
        summary: "Follow User",
        description: "Follows a target user and issues a follow notification.",
        security: [
          {
            cookieAuth: [],
            csrfHeader: []
          }
        ],
        parameters: [
          {
            name: "userId",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "ID of the user to follow."
          }
        ],
        responses: {
          200: {
            description: "Followed successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: {
                      type: "object",
                      properties: {
                        following: { type: "boolean", example: true }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      delete: {
        tags: ["Users"],
        summary: "Unfollow User",
        description: "Unfollows a target user.",
        security: [
          {
            cookieAuth: [],
            csrfHeader: []
          }
        ],
        parameters: [
          {
            name: "userId",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "ID of the user to unfollow."
          }
        ],
        responses: {
          200: {
            description: "Unfollowed successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: {
                      type: "object",
                      properties: {
                        following: { type: "boolean", example: false }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/api/users/{userId}/ignore": {
      post: {
        tags: ["Users"],
        summary: "Ignore User",
        description: "Ignores user suggestions (e.g. hides them from suggested followers).",
        security: [
          {
            cookieAuth: [],
            csrfHeader: []
          }
        ],
        parameters: [
          {
            name: "userId",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "ID of the suggested user to ignore."
          }
        ],
        responses: {
          200: {
            description: "User ignored successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: {
                      type: "object",
                      properties: {
                        ignored: { type: "boolean", example: true }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/api/notifications": {
      get: {
        tags: ["Notifications"],
        summary: "Get Notifications",
        description: "Lists notifications received by the logged in user.",
        responses: {
          200: {
            description: "Notifications list",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: {
                      type: "array",
                      items: {
                        $ref: "#/components/schemas/NotificationDto"
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/api/notifications/read": {
      patch: {
        tags: ["Notifications"],
        summary: "Mark All Read",
        description: "Marks all notifications as read.",
        security: [
          {
            cookieAuth: [],
            csrfHeader: []
          }
        ],
        responses: {
          200: {
            description: "Notifications marked read",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: {
                      type: "object",
                      properties: {
                        read: { type: "boolean", example: true }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/api/health": {
      get: {
        tags: ["Health Check"],
        summary: "System Health Status",
        description: "Quick system health indicator API.",
        responses: {
          200: {
            description: "Healthy",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: {
                      type: "object",
                      properties: {
                        status: { type: "string", example: "ok" }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  components: {
    securitySchemes: {
      cookieAuth: {
        type: "apiKey",
        in: "cookie",
        name: "access_token",
        description: "Session authorization JWT cookie.",
      },
      csrfHeader: {
        type: "apiKey",
        in: "header",
        name: "x-csrf-token",
        description: "Double submit CSRF token header.",
      },
    },
    schemas: {
      Visibility: {
        type: "string",
        enum: ["PUBLIC", "PRIVATE"]
      },
      UserDto: {
        type: "object",
        required: ["id", "firstName", "lastName", "email", "avatarUrl"],
        properties: {
          id: { type: "string" },
          firstName: { type: "string" },
          lastName: { type: "string" },
          email: { type: "string", format: "email" },
          avatarUrl: { type: "string", nullable: true }
        }
      },
      CommentDto: {
        type: "object",
        required: ["id", "text", "author", "parentId", "likeCount", "likedByMe", "createdAt", "replies"],
        properties: {
          id: { type: "string" },
          text: { type: "string" },
          author: { $ref: "#/components/schemas/UserDto" },
          parentId: { type: "string", nullable: true },
          likeCount: { type: "integer" },
          likedByMe: { type: "boolean" },
          createdAt: { type: "string", format: "date-time" },
          replies: {
            type: "array",
            items: { $ref: "#/components/schemas/CommentDto" }
          }
        }
      },
      PostDto: {
        type: "object",
        required: ["id", "text", "visibility", "imageUrl", "author", "likeCount", "commentCount", "likedByMe", "createdAt"],
        properties: {
          id: { type: "string" },
          text: { type: "string" },
          visibility: { $ref: "#/components/schemas/Visibility" },
          imageUrl: { type: "string", nullable: true },
          author: { $ref: "#/components/schemas/UserDto" },
          likeCount: { type: "integer" },
          commentCount: { type: "integer" },
          likedByMe: { type: "boolean" },
          createdAt: { type: "string", format: "date-time" },
          comments: {
            type: "array",
            items: { $ref: "#/components/schemas/CommentDto" }
          }
        }
      },
      NotificationDto: {
        type: "object",
        required: ["id", "type", "text", "readAt", "createdAt"],
        properties: {
          id: { type: "string" },
          type: { type: "string" },
          text: { type: "string" },
          readAt: { type: "string", format: "date-time", nullable: true },
          createdAt: { type: "string", format: "date-time" }
        }
      },
      RegisterInput: {
        type: "object",
        required: ["firstName", "lastName", "email", "password"],
        properties: {
          firstName: { type: "string", minLength: 1, maxLength: 60 },
          lastName: { type: "string", minLength: 1, maxLength: 60 },
          email: { type: "string", format: "email", maxLength: 255 },
          password: { type: "string", minLength: 8, maxLength: 128 }
        }
      },
      LoginInput: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email" },
          password: { type: "string", minLength: 1 }
        }
      },
      CreatePostInput: {
        type: "object",
        required: ["text"],
        properties: {
          text: { type: "string", minLength: 1, maxLength: 5000 },
          visibility: { $ref: "#/components/schemas/Visibility", default: "PUBLIC" }
        }
      },
      CreateCommentInput: {
        type: "object",
        required: ["text"],
        properties: {
          text: { type: "string", minLength: 1, maxLength: 1200 }
        }
      },
      ApiError: {
        type: "object",
        required: ["error"],
        properties: {
          error: {
            type: "object",
            required: ["code", "message"],
            properties: {
              code: { type: "string" },
              message: { type: "string" },
              details: { type: "object", nullable: true }
            }
          }
        }
      }
    }
  }
};
