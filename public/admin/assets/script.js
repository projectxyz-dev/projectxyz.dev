function login(showAlert = true) {
    const content = document.getElementById("content");
    const input = document.getElementById("token");
    const loginPanel = document.getElementById("login");
    const welcomeBackText = document.getElementById("wb");
    const manageUsersPanel = document.getElementById("manage");
    const notificationsPanel = document.getElementById("notifications");
    let token = input.value.trim() || localStorage.getItem("adminToken");

    if (!token) {
        if (showAlert) {
            alert("Please enter a token.");
        }
        return;
    }

    fetch(`https://api.projectxyz.dev/admin/login?token=${encodeURIComponent(token)}`)
        .then(response => {
            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error("Unauthorized");
                }
                throw new Error("Invalid token");
            }
            return response.json();
        })
        .then(data => {
            localStorage.setItem("adminToken", token);
            localStorage.setItem("permissions", data.permissions);
            console.log("Username:", data.username);
            console.log("Permission Level:", data.permissions);
            content.classList.remove("hidden");
            loginPanel.classList.add("hidden");
            if(data.permissions === 0){
                data.permissions = "0 (full access)";
                manageUsersPanel.classList.remove("hidden");
                fetchUsers();
            }
            notificationsPanel.classList.remove("hidden");
            fetchNotifications();

            welcomeBackText.innerHTML = `welcome back, <code>${data.username}</code>.<br>your permission level: <code>${data.permissions}</code>`;
        })
        .catch(error => {
            console.error("Error during login:", error);
            if (error.message === "Unauthorized") {
                alert("Invalid token. Please try again.");
                localStorage.removeItem("adminToken"); // Remove invalid token
                input.value = ""; // Clear input field
            }
        });

}
document.addEventListener("DOMContentLoaded", () => {
    const loginButton = document.getElementById("login-btn");
    if (loginButton) {
        loginButton.addEventListener("click", () => login(true)); // Shows alert if missing token
    } else {
        console.error("Login button not found!");
    }

    login(false); // Auto-login, but don't show alert if token is missing
});
function logout(){
    localStorage.removeItem("adminToken");
    location.reload();
}
function fetchUsers(){
    // requires permission level 0
    let token = localStorage.getItem("adminToken");
    const users = document.getElementById("users");
    fetch(`https://api.projectxyz.dev/admin/users?token=${encodeURIComponent(token)}`)
        .then(response => response.json())
        .then(data => {
            console.log("API Response:", data); // Debugging
            users.innerHTML = "";
            if (!data.users || typeof data.users !== "object") {
                throw new Error("Invalid response format: users is not an object");
            }

            Object.entries(data.users).forEach(([key, user]) => {
                let userDiv = document.createElement("div");
                userDiv.classList.add("user-info");

                let h1 = document.createElement("h3");
                h1.textContent = key; // User key (ID)

                let h3 = document.createElement("p");
                h3.textContent = user.username;

                let p = document.createElement("p");
                p.textContent = `Permissions: ${user.permissions}`;
                let deleteBtn = document.createElement("button");
                deleteBtn.textContent = "Delete";
                deleteBtn.addEventListener("click", () => {
                    if(confirm("Are you sure you want to delete this user?")){
                        fetch(`https://api.projectxyz.dev/admin/users?token=${encodeURIComponent(token)}&target=${key}`, {
                            method: "DELETE"
                        }).then(r => {
                            if(r.ok){
                                fetchUsers();
                            }
                            else{
                                alert("Error deleting user");
                            }
                        })
                    }
                })

                userDiv.appendChild(h1);
                userDiv.appendChild(h3);
                userDiv.appendChild(p);
                userDiv.appendChild(deleteBtn);

                users.appendChild(userDiv);
            });
        })
        .catch(error => {
            console.error("Error fetching users:", error);
        });

}
function fetchNotifications(){
        const apiUrl = 'https://api.projectxyz.dev/notifications';
        const newsSection = document.getElementById('notifications-list');

        if (!newsSection) {
            console.error("Error: Element with id 'news-section' not found!");
            return;
        }

        fetch(apiUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                console.log('API Response:', data); // Debugging step
                try {
                    const notifications = data.notifications;
                    const permissions = localStorage.getItem("permissions");
                    newsSection.innerHTML = '';
                    if (!notifications || !Array.isArray(notifications)) {
                        throw new Error('Invalid or missing "notifications" array');
                    }

                    if (notifications.length === 0) {
                        const noNewsMessage = document.createElement('p');
                        noNewsMessage.textContent = 'No news at the moment.';
                        newsSection.appendChild(noNewsMessage);
                        return;
                    }

                    notifications.forEach(notification => {
                        const newsItem = document.createElement('div');
                        newsItem.className = 'news-item';
                        const title = document.createElement('h3');
                        title.textContent = notification.title;
                        const description = document.createElement('p');
                        const deleteBtn = document.createElement('button');
                        deleteBtn.textContent = 'Delete';
                        deleteBtn.addEventListener('click', () => {
                            
                            const notificationTitle = notification.title; // Get title of the notification
                            const token = localStorage.getItem("adminToken"); // Retrieve admin token
                            fetch(`https://api.projectxyz.dev/notifications/delete?token=${encodeURIComponent(token)}`, {
                                method: "DELETE",
                                headers: {
                                    "Content-Type": "application/json"
                                },
                                body: JSON.stringify({
                                    "title": notificationTitle
                                })
                            }).then(r => {
                                if (r.ok) {
                                    fetchNotifications(); // Refresh the notifications list
                                } else {
                                    alert("Error deleting notification");
                                }
                            }).catch(error => {
                                console.error("Error while deleting notification:", error);
                                alert("An error occurred");
                            });
                        })
                        var timestamp = getRelativeTime(notification.timestamp);
                        description.textContent = notification.description + ` ~${timestamp}`;
                        newsItem.appendChild(title);
                        newsItem.appendChild(description);
                        newsItem.appendChild(deleteBtn);
                        newsSection.appendChild(newsItem);
                        if(permissions < 3){

                        }
                    });
                } catch (error) {
                    console.error('Error processing notifications:', error);
                }
            })
            .catch(error => {
                console.error('Error fetching the news:', error);
            });

}
function getRelativeTime(timestamp) {
    const now = Math.floor(Date.now() / 1000); // Get current time in seconds
    const diff = now - timestamp;

    if (diff < 60) return `Just now`;
    if (diff < 3600) {
        const minutes = Math.floor(diff / 60);
        return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
    }
    if (diff < 86400) {
        const hours = Math.floor(diff / 3600);
        return `${hours} hour${hours === 1 ? "" : "s"} ago`;
    }
    if (diff < 2592000) {
        const days = Math.floor(diff / 86400);
        return `${days} day${days === 1 ? "" : "s"} ago`;
    }
    if (diff < 31536000) {
        const months = Math.floor(diff / 2592000);
        return `${months} month${months === 1 ? "" : "s"} ago`;
    }

    const years = Math.floor(diff / 31536000);
    return `${years} year${years === 1 ? "" : "s"} ago`;
}
function createNewUserDialog(){
    const dialog = document.getElementById("createUserDialog");

    if(dialog.classList.contains("hidden")){
        dialog.classList.remove("hidden");
    }
    else{
        dialog.classList.add("hidden");
    }
}
function newNotificationDialog(){
    const dialog = document.getElementById("createNotification");
    if(dialog.classList.contains("hidden")){
        dialog.classList.remove("hidden");
    }
    else{
        dialog.classList.add("hidden");
    }
}
function createUser(){
    const username = document.getElementById("newUserUsername").value;
    const permissions = document.getElementById("newUserPermissions").value;
    const token = localStorage.getItem("adminToken");
    fetch(`https://api.projectxyz.dev/admin/users?token=${encodeURIComponent(token)}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            "username": username,
            "permissions": permissions
        })
    }).then(r  =>{
        if(r.ok){
            fetchUsers();
        }
        else{
            alert("Error creating user");
        }
    })
}
function createNotification(){
    const title = document.getElementById("newNotificationTitle").value;
    const description = document.getElementById("newNotificationDescription").value;
    const token = localStorage.getItem("adminToken");
    fetch(`https://api.projectxyz.dev/notifications/new?token=${encodeURIComponent(token)}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            "title": title,
            "description": description,
            "timestamp": Math.floor(Date.now() / 1000)
        })
    }).then(r  =>{
        if(r.ok){
            fetchNotifications();
        }
        else{
            alert("Error creating notification");
        }
    })
}