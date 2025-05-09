
const API_URL = "https://311a-160-22-60-12.ngrok-free.app/api/v1";

// User API
export const userApi = {
  getUserById: async (id: string) => {
    const response = await fetch(`${API_URL}/user/byId/${id}`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch user");
    }
    
    return response.json();
  }
};

// Chat API
export const chatApi = {
  accessChat: async (studentId: string, courseId: string, question: string) => {
    const response = await fetch(`${API_URL}/chat/access-chat`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ studentId, courseId, question }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to access chat");
    }
    
    return response.json();
  },
  
  getAllChats: async (page = 1) => {
    const response = await fetch(`${API_URL}/chat/getAllChats?page=${page}`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch chats");
    }
    
    return response.json();
  }
};

// Message API
export const messageApi = {
  getMessages: async (chatId: string) => {
    const response = await fetch(`${API_URL}/message/get-messages/${chatId}`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch messages");
    }
    
    return response.json();
  },
  
  sendMessage: async (message: string, chatId: string, files?: File[]) => {
    const formData = new FormData();
    formData.append("message", message);
    formData.append("chatId", chatId);
    
    if (files && files.length > 0) {
      files.forEach(file => {
        formData.append("files", file);
      });
    }
    
    const response = await fetch(`${API_URL}/message/sendMessage`, {
      method: "POST",
      credentials: "include",
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to send message");
    }
    
    return response.json();
  },
  
  uploadFiles: async (files: File[]) => {
    const formData = new FormData();
    
    files.forEach(file => {
      formData.append("files", file);
    });
    
    const response = await fetch(`${API_URL}/message/upload-files`, {
      method: "POST",
      credentials: "include",
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to upload files");
    }
    
    return response.json();
  }
};

// Course API
export const courseApi = {
  createCourse: async (name: string, description: string) => {
    const response = await fetch(`${API_URL}/course/create`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, description }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to create course");
    }
    
    return response.json();
  },
  
  getAllCourses: async () => {
    const response = await fetch(`${API_URL}/course/all`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch courses");
    }
    
    return response.json();
  },
  
  getCourseById: async (id: string) => {
    const response = await fetch(`${API_URL}/course/${id}`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch course");
    }
    
    return response.json();
  }
};
