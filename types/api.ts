export interface ApiResponse<T = any> {
  success: boolean
  message?: string
  data?: T
  token?: string
}

export interface LoginRequest {
  username: string
  password: string
}

export interface BuyRequest {
  action: 'buy'
  name: string
  quantity: number
  price: number
  date?: string
  created_at_date?: string
}

export interface SellRequest {
  action: 'sell'
  name: string
  quantity: number
  price: number
  date?: string
  created_at_date?: string
}

export interface SetGoalRequest {
  action: 'set_goal'
  goal_value: number
}

export interface EditItemRequest {
  action: 'edit_item'
  item_id: number
  name: string
  quantity: number
  average_price: number
}

export interface DeleteItemRequest {
  action: 'delete_item'
  item_id: number
}

export interface GetSalesChartRequest {
  action: 'get_sales_chart'
}

