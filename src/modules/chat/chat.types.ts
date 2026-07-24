export interface ChatMessage {
  role: "user" | "assistant";
  text: string;
}

export interface OrderInput {
  itemName: string;
  quantity: number;
  phoneNumber: string;
  address: string; 
}