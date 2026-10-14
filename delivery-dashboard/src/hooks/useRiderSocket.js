import { useEffect } from "react";
import { socket } from "../services/socket";
import { updateLocationAPI } from "../services/deliveryService";
import { useDispatch } from "react-redux";
import { addDeliveryTask, getNearbyDeliveries } from "../Redux/deliveryTaskSlice";

const PLACEHOLDER_COORDS = [77.209, 28.613];

export const useRiderSocket = (riderId, token) => {
  console.log("useRiderSocket hook running");
  const dispatch = useDispatch();
  useEffect(() => {
    if (!riderId || !token) return;

    socket.connect();

    socket.on("connect", async () => {
      console.log("Socket connected:", socket.id);

      socket.emit("registerRider", riderId);

      try {
        await updateLocationAPI(PLACEHOLDER_COORDS[0], PLACEHOLDER_COORDS[1]);
        console.log("Location updated");
      } catch {
        console.log("Location update failed");
      }
    });

    socket.on("newDeliveryRequest", (task) => {
      console.log("New delivery request:", task);
      dispatch(addDeliveryTask(task));
      // Keep Nearby Radar list in sync with backend pool
      dispatch(getNearbyDeliveries());
    });

    return () => {
      socket.disconnect();
    };
  }, [riderId, token]);
};
