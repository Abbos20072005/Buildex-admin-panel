/** Schema `Manager` of the Dommaster Admin API. */
export interface ManagerDto {
  id: number;
  full_name: string;
  is_active?: boolean;
  created_at: string;
  updated_at: string;
}
