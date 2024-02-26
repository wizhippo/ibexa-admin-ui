import { getAdminUiConfig, getRootNodeSelector } from "./helpers/context.helper";
import { escapeHTML } from "./helpers/text.helper";
import { getIconPath } from "./helpers/icon.helper";

const notificationsContainer = null;
const notifications = null;

export const initNotifications = (notificationsContainer) => {
    const adminUiConfig = getAdminUiConfig();
    const notifications = JSON.parse(notificationsContainer.dataset.notifications);
    
    console.log("Selector:", getRootNodeSelector);

    Object.entries(notifications).forEach(([label, messages]) => {
        messages.forEach((message) => addNotification({ detail: { label, message } }));
    });

    doc.body.addEventListener('ibexa-notify', addNotification, false);
}

export const addNotification = ({ detail }) => {
}