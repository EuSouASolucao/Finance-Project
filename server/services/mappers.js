export function mapTransaction(row) {
  return {
    id: row.id,
    type: row.type,
    description: row.description,
    amount: Number(row.amount),
    category: row.category,
    date: row.transaction_date instanceof Date ? row.transaction_date.toISOString().split('T')[0] : row.transaction_date,
    paymentStatus: row.payment_status,
    createdAt: row.created_at,
  };
}

export function mapGoal(row) {
  return {
    id: row.id,
    title: row.title,
    targetAmount: Number(row.target_amount),
    currentAmount: Number(row.current_amount),
    deadline: row.deadline instanceof Date ? row.deadline.toISOString().split('T')[0] : row.deadline,
    createdAt: row.created_at,
  };
}

export function mapRecurring(row) {
  return {
    id: row.id,
    description: row.description,
    type: row.type,
    amount: Number(row.amount),
    category: row.category,
    dayOfMonth: Number(row.day_of_month),
    paymentStatus: row.payment_status,
    active: Boolean(row.active),
    createdAt: row.created_at,
  };
}

export function mapBudget(row) {
  return {
    id: row.id,
    category: row.category,
    monthlyLimit: Number(row.monthly_limit),
    alertPercentage: Number(row.alert_percentage),
    createdAt: row.created_at,
  };
}

export function mapCreditCard(row) {
  return {
    id: row.id,
    name: row.name,
    limit: Number(row.card_limit),
    closingDay: Number(row.closing_day),
    dueDay: Number(row.due_day),
    currentInvoice: Number(row.current_invoice),
    createdAt: row.created_at,
  };
}

export function mapSharedAccess(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    permission: row.permission,
    createdAt: row.created_at,
  };
}
