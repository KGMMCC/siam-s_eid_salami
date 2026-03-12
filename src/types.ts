export interface Submission {
  id: number;
  sender_name: string;
  amount: number;
  payment_method: string;
  transaction_id: string;
  message: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export interface Settings {
  bkash_number: string;
  nagad_number: string;
  bank_name: string;
  account_name: string;
  account_number: string;
  routing_number: string;
  branch_name: string;
  swift_code: string;
  hero_title: string;
  hero_message: string;
  about_message: string;
}

export interface ApprovedSubmission {
  sender_name: string;
  amount: number;
  message: string;
  created_at: string;
}
