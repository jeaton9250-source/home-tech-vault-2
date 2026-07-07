type SubscriptionCardProps = {
  subscription: {
    id: string;
    service_name: string;
    category?: string;
    monthly_cost?: number;
    renewal_date?: string;
    billing_cycle?: string;
    notes?: string;
  };
};

export default function SubscriptionCard({ subscription }: SubscriptionCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow p-6 border border-gray-100">
      <h2 className="text-xl font-bold text-blue-950">
        {subscription.service_name}
      </h2>

      <p className="text-gray-500">{subscription.category || "Subscription"}</p>

      <div className="mt-5 space-y-2 text-sm">
        <p><strong>Cost:</strong> ${subscription.monthly_cost || 0}/mo</p>
        <p><strong>Billing:</strong> {subscription.billing_cycle || "-"}</p>
        <p><strong>Renews:</strong> {subscription.renewal_date || "-"}</p>
      </div>

      {subscription.notes && (
        <p className="mt-4 text-gray-600">{subscription.notes}</p>
      )}
    </div>
  );
}