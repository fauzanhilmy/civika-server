const db = require("../firestore");
const announce = db.collection("announcement");
const dataPushNotif = db.collection("dataUserLogin");
const fetch = require("node-fetch");

class AnnouncementController {
  static async getAnouncement(req, res, next) {
    try {
      const snapshot = await announce.get();
      const notification = [];
      snapshot.forEach((doc) => {
        const id = doc.id;
        const { message, title, teacher } = doc.data();
        const data = {
          id,
          message,
          title,
          teacher,
        };
        notification.push(data);
      });
      res.send(notification);
    } catch (error) {
      next(error);
    }
  }

  static async addAnnouncement(req, res, next) {
    const { teacher, title, message } = req.body;
    const snapshotToken = await dataPushNotif.get();
    const data = { teacher, title, message };
    try {
      //! For add data to firestore
      let announcementPosted = await announce.add(data);

      //! For push notification to user if users is login
      snapshotToken.forEach((token) => {
        const { pushToken } = token.data();
        const messageToPushNotif = {
          to: pushToken,
          title,
          body: message,
          data: { data: "ini data" },
        };

        fetch("https://exp.host/--/api/v2/push/send", {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Accept-encoding": "gzip, deflate",
            "Content-Type": "application/json",
            "cache-control": "no-cache",
          },
          body: JSON.stringify(messageToPushNotif),
        });

        res.status(200).json({
          id: announcementPosted.id,
          message: "Pengumuman berhasil dikirim",
        });
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteAnnouncement(req, res, next) {
    const { id } = req.params;
    try {
      await announce.doc(id).delete();
      res.status(200).json({ message: "Pengumuman berhasil dihapus" });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AnnouncementController;