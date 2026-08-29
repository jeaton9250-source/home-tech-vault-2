import {
  NextResponse,
} from "next/server";

import {
  clearClientVaultMode,
} from "@/lib/realtor/clientVaultMode";

import {
  createClient,
} from "@/lib/supabase/server";

export const dynamic =
  "force-dynamic";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export async function DELETE(
  _request: Request,
  {
    params,
  }: Props
) {
  try {
    const {
      id,
    } = await params;

    const supabase =
      await createClient();

    const {
      data: {
        user,
      },
    } =
      await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        {
          error:
            "You must be signed in.",
        },
        {
          status: 401,
        }
      );
    }

    const {
      data,
      error,
    } = await supabase.rpc(
      "remove_realtor_client_vault",
      {
        p_gift_id: id,
      }
    );

    if (error) {
      console.error(
        "[remove-client-vault] RPC failed:",
        error
      );

      const message =
        error.message || "";

      if (
        message.includes(
          "CLIENT_VAULT_ALREADY_CLAIMED"
        )
      ) {
        return NextResponse.json(
          {
            error:
              "This home has already been handed off to the buyer and cannot be removed.",
          },
          {
            status: 403,
          }
        );
      }

      if (
        message.includes(
          "CLIENT_VAULT_NOT_FOUND"
        )
      ) {
        return NextResponse.json(
          {
            error:
              "Client Vault not found.",
          },
          {
            status: 404,
          }
        );
      }

      if (
        message.includes(
          "CLIENT_VAULT_NOT_OWNED"
        )
      ) {
        return NextResponse.json(
          {
            error:
              "You no longer own this Client Vault.",
          },
          {
            status: 403,
          }
        );
      }

      throw error;
    }

    /*
     * Clearing Client Vault Mode is safe even when the
     * Realtor is currently viewing My Home.
     */
    await clearClientVaultMode();

    return NextResponse.json(
      {
        ok: true,
        result: data,
      },
      {
        headers: {
          "Cache-Control":
            "private, no-store, max-age=0",
        },
      }
    );
  } catch (error) {
    console.error(
      "[remove-client-vault] failed:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to remove this home right now.",
      },
      {
        status: 500,
      }
    );
  }
}
