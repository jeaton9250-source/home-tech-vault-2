import {
  deleteDeviceForViewer,
  DeviceDeleteError,
} from "@/lib/devices/deleteDevice";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function DELETE(
  _request: Request,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const deviceId = id?.trim();

    if (!deviceId) {
      return Response.json(
        { error: "A device id is required." },
        { status: 400 }
      );
    }

    const deleted = await deleteDeviceForViewer(
      deviceId
    );

    return Response.json({
      ok: true,
      deviceId: deleted.id,
      deviceName: deleted.deviceName,
    });
  } catch (error) {
    if (error instanceof DeviceDeleteError) {
      return Response.json(
        { error: error.message },
        { status: error.status }
      );
    }

    console.error(
      "Device delete error:",
      error instanceof Error
        ? error.message
        : error
    );

    return Response.json(
      {
        error:
          "Unable to delete this device. Please try again.",
      },
      { status: 500 }
    );
  }
}
