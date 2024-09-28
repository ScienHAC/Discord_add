# 🌌 AddBits Supernova - Channel User Management Bot

Welcome to the **AddBits Supernova** Discord bot repository! **AddBits Supernova** is designed to simplify user management across all channels in your Discord server. With intuitive commands, you can effortlessly add or remove users and roles from channels, ensuring efficient communication and collaboration.

---

## 🌟 Key Features

- 🔑 **User Management**: Add or remove users and roles across all channels with ease.
- 🛡️ **Permissions Control**: Customize channel permissions to enhance security and privacy.
- ⚡ **Effortless Operations**: Use simple slash commands to manage users quickly and efficiently.
- 📅 **User-Friendly**: Designed for both server administrators and general users, making management straightforward.

---

## 🛠 Installation

To set up **AddBits Supernova** on your server, follow these steps:

1. **Clone the repository**:
    ```bash
    git clone git@github.com:ScienHAC/Discord_add.git
    ```

2. **Navigate to the bot directory**:
    ```bash
    cd Discord_add
    ```

3. **Install dependencies**:
    ```bash
    npm install
    ```

4. **Set up environment variables**:

   Create a `.env` file in the root directory with your credentials:
    ```env
    TOKEN=your_discord_token
    CLIENT_ID=your_discord_client_id
    ```

5. **Start the bot**:
    ```bash
    npm start
    ```

---

## 🔧 Commands

**AddBits Supernova** offers several commands to help manage users effectively. Here’s a quick guide:

| Command                     | Description                                               | Example                                      |
| --------------------------- | --------------------------------------------------------- | -------------------------------------------- |
| `/add-user`                 | Add a user or role to all channels in the server.         | `/add-user usr:@user role:@role`            |
| `/remove-user`              | Remove a user or role from a specific channel.            | `/remove-user usr:@user role:@role channel:#channel` |
| `/remove-user-all`          | Remove a user from all channels in the server.            | `/remove-user-all usr:@user`                 |

**Note**: Make sure you have the appropriate permissions to execute these commands.

---

## 🧑‍💻 Contributing

We welcome contributions! Feel free to open issues or submit pull requests to help improve **AddBits Supernova**.

### To contribute:
1. Fork this repository.
2. Make your changes in a new branch.
3. Submit a pull request, and we’ll review it!

---

## 📜 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

### 🌟 Show Your Support

If you find **AddBits Supernova** helpful, consider giving this repository a ⭐ to show your support!

---

For any inquiries or support, feel free to reach out!
