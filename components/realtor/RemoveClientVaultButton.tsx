"use client";

import {
  useState,
} from "react";

import {
  Loader2,
  Trash2,
} from "lucide-react";

type Props = {
  giftId: string;
  address: string;
};

export default function RemoveClientVaultButton({
  giftId,
  address,
}: Props) {
  const [
    removing,
    setRemoving,
  ] = useState(false);

  async function removeHome() {
    const confirmed =
      window.confirm(
        `Remove ${address}?\n\nThis permanently removes this Client Vault and the property information stored inside it. This cannot be undone.`
      );

    if (!confirmed) {
      return;
    }

    setRemoving(true);

    try {
      const response =
        await fetch(
          `/api/realtor/gifts/${giftId}/remove`,
          {
            method:
              "DELETE",
          }
        );

      const payload =
        (await response.json()) as {
          ok?: boolean;
          error?: string;
        };

      if (
        !response.ok ||
        !payload.ok
      ) {
        throw new Error(
          payload.error ||
            "Unable to remove this home."
        );
      }

      [
        window.sessionStorage,
        window.localStorage,
      ].forEach(
        (storage) => {
          Object.keys(
            storage
          ).forEach((key) => {
            if (
              key.startsWith(
                "htv:permissions:"
              )
            ) {
              storage.removeItem(
                key
              );
            }
          });
        }
      );

      window.location.reload();
    } catch (error) {
      setRemoving(false);

      window.alert(
        error instanceof Error
          ? error.message
          : "Unable to remove this home."
      );
    }
  }

  return (
    <button
      type="button"
      disabled={removing}
      onClick={() => {
        void removeHome();
      }}
      className="inline-flex items-center gap-1.5 rounded-full border border-[#9a5b52]/15 bg-[#9a5b52]/[0.05] px-3 py-1.5 text-[10px] font-semibold text-[#91554c] transition hover:border-[#9a5b52]/25 hover:bg-[#9a5b52]/10 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {removing ? (
        <Loader2
          size={13}
          className="animate-spin"
        />
      ) : (
        <Trash2
          size={13}
        />
      )}

      {removing
        ? "Removing..."
        : "Remove Home"}
    </button>
  );
}
