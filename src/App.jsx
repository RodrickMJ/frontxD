import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import axios from "axios";

const socket = io("http://localhost:3000");

const App = () => {
    const [activities, setActivities] = useState([]);
    const [suspicious, setSuspicious] = useState(false);

    useEffect(() => {
        // Socket.io listener
        socket.on("activity", (activity) => {
            setActivities((prevActivities) => [...prevActivities, activity]);
            checkForSuspiciousActivity(activity);
        });

        // Clean up Socket.io listener
        return () => {
            socket.off("activity");
        };
    }, []);

    useEffect(() => {
        // EventSource listener for SSE
        const eventSource = new EventSource("http://localhost:3000/events");

        eventSource.onmessage = function(event) {
            const activity = JSON.parse(event.data);
            setActivities((prevActivities) => [...prevActivities, activity]);
            checkForSuspiciousActivity(activity);
        };

        // Clean up EventSource listener
        return () => {
            eventSource.close();
        };
    }, []);

    const checkForSuspiciousActivity = async (activity) => {
        if (activity.userId === "6677f990a804a94f5bbb565a") { // Reemplaza con el ID real del usuario "ladrón"
            setSuspicious(true);
            try {
                await axios.post("http://localhost:3000/activities/suspicious", activity);
            } catch (error) {
                console.error("Error al registrar actividad sospechosa:", error);
            }
        } else {
            setSuspicious(false);
        }
    };

    const isSuspiciousActivity = (userId) => {
        return userId === "6677f990a804a94f5bbb565a"; // Reemplaza con el ID real del usuario "ladrón"
    };

    const performAction = async (action) => {
        const userId = "6677f990a804a94f5bbb5657"; // Reemplaza con el ID del usuario que quieres simular usuario admin o ladron(thief)
        try {
            await axios.post("http://localhost:3000/activities/action", { userId, action });
        } catch (error) {
            console.error(`Error performing ${action}:`, error);
        }
    };

    return (
        <div>
            <h1>Activities</h1>
            <button onClick={() => performAction("openMainDoor")}>Open Main Door</button>
            <button onClick={() => performAction("closeMainDoor")}>Close Main Door</button>
            <ul>
                {activities.map((activity, index) => (
                    <li
                        key={index}
                        className={isSuspiciousActivity(activity.userId) ? "suspicious-activity" : ""}
                    >
                        {`User ${activity.userId} performed ${activity.action} at ${new Date(activity.timestamp).toLocaleString()}`}
                    </li>
                ))}
            </ul>
            {suspicious && <p className="suspicious-message">¡Actividad sospechosa detectada!</p>}
        </div>
    );
};

export default App;
