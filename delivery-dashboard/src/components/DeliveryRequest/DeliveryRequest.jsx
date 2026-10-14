import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { MapPin } from "lucide-react";
import { removeDeliveryTask } from "../../Redux/deliveryTaskSlice";
import { acceptDeliveryTaskAPI } from "../../services/deliveryService";

const DeliveryRequest = () => {

  const dispatch = useDispatch();

  const tasks = useSelector(
    (state) => state.deliveryTasks.tasks
  );

  const [timers, setTimers] = useState({});
  const [loadingTask, setLoadingTask] = useState(null);

  /* Countdown timer */

  useEffect(() => {

    const interval = setInterval(() => {

      setTimers(prev => {

        const updated = { ...prev };

        Object.keys(updated).forEach(taskId => {

          updated[taskId] -= 1;

          if (updated[taskId] <= 0) {
            dispatch(removeDeliveryTask(taskId));
            delete updated[taskId];
          }

        });

        return updated;

      });

    }, 1000);

    return () => clearInterval(interval);

  }, [dispatch]);

  /* Initialize timer for new tasks */

  useEffect(() => {

    tasks.forEach(task => {

      setTimers(prev => {

        if (prev[task.taskId]) return prev;

        return {
          ...prev,
          [task.taskId]: 10
        };

      });

    });

  }, [tasks]);

  /* Accept handler */

  const handleAccept = async (taskId) => {

    console.log("Accept clicked:", taskId);

    try {

      setLoadingTask(taskId);

      await acceptDeliveryTaskAPI(taskId);

      dispatch(removeDeliveryTask(taskId));

    } catch (err) {

      const message = err?.response?.data?.message || "Failed to accept task";
      alert(message);

    dispatch(removeDeliveryTask(taskId));

    } finally {

      setLoadingTask(null);

    }

  };

  if (!tasks.length) return null;

  return (

    <div className="delivery-request-container">

      <h2 className="delivery-request-title">
        Nearby Delivery Requests
      </h2>

      <div className="delivery-request-grid">

        {tasks.map(task => {

          const timeLeft = timers[task.taskId] ?? 10;

          return (

            <div
              key={task.taskId}
              className="delivery-request-card"
            >

              <div className="delivery-request-info">

                <h3 className="task-id">
                  Task #{task.taskId}
                </h3>

                <p className="task-location">
                  <MapPin size={16}/>
                  Pickup: {task.pickup?.street || "Store"}
                </p>

                <p className="task-location">
                  <MapPin size={16}/>
                  Drop: {task.drop?.street || "Customer"}
                </p>

              </div>

              <div className="countdown-bar">
                <div
                  className="countdown-progress"
                  style={{
                    width: `${(timeLeft / 10) * 100}%`
                  }}
                />
              </div>

              <div className="countdown-text">
                {timeLeft}s remaining
              </div>

              <div className="delivery-request-actions">

                <button
                  className="accept-btn"
                  disabled={loadingTask === task.taskId}
                  onClick={() => handleAccept(task.taskId)}
                >
                  {loadingTask === task.taskId
                    ? "Accepting..."
                    : "Accept"}
                </button>

                <button
                  className="dismiss-btn"
                  onClick={() =>
                    dispatch(removeDeliveryTask(task.taskId))
                  }
                >
                  Dismiss
                </button>

              </div>

            </div>

          );

        })}

      </div>

    </div>

  );

};

export default DeliveryRequest;