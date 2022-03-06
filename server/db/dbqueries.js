const knex = require("./knex");

module.exports = {
  getAll(table) {
    return knex(table);
  },
  getOne(table, id) {
    return knex(table).where("id", id).first();
  },
  getOneSpotifyId(table, type, id) {
    return knex(table).where(`${type}_spotifyId`, id).first();
  },
  async join(tableA, tableB, targetA, targetB) {
    return await knex(tableA).join(
      tableB,
      `${tableA}.${targetA}`,
      "=",
      `${tableB}.${targetB}`
    );
  },
  async findOrCreateUser(username, spotifyId) {
    try {
      const res = await knex
        .select("id", "user_spotifyId")
        .from("users")
        .where("user_spotifyId", spotifyId)
        .then((userList) => {
          if (userList.length === 0) {
            return knex("users")
              .returning(["username", "user_spotifyId"])
              .insert({ username, user_spotifyId: spotifyId })
              .then((newUser) => {
                console.log(`Inserted new user: ${newUser[0].user_spotifyId}`);
                return newUser;
              });
          }
          console.log("User already exists");
          return userList[0];
        });

      return res;
    } catch (err) {
      console.log("Something went wrong.");
      console.error(err);
      process.exit(1);
    }
  },
  async addPlaylist(user_id, spotifyId, name, description, ownerId, ownerName) {
    try {
      const res = await knex
        .select("playlist_spotifyId")
        .from("playlists")
        .where("playlist_spotifyId", spotifyId)
        .then((playlist) => {
          if (playlist.length === 0) {
            return knex("playlists")
              .returning([
                "user_id",
                "playlist_spotifyId",
                "playlist_name",
                "description",
                "ownerId",
                "ownerName",
              ])
              .insert({
                user_id,
                playlist_spotifyId: spotifyId,
                playlist_name: name,
                description,
                ownerId,
                ownerName,
              })
              .then((playlists) => {
                console.log(playlists);
                return playlists;
              });
          }

          console.log(`Playlist already added ${playlist}`);
          return {
            playlist: playlist[0].playlist_spotifyId,
            note: "Playlist already added",
          };
        });

      return res;
    } catch (err) {
      console.log("Something went wrong.");
      console.error(err);
      process.exit(1);
    }
  },
  async addSong(user_id, playlist_id, spotifyId, name, artists) {
    try {
      const res = await knex
        .select("track_spotifyId")
        .from("songs")
        .where("track_spotifyId", spotifyId)
        .then((song) => {
          if (song.length === 0) {
            return knex("songs")
              .returning([
                "user_id",
                "playlist_id",
                "track_spotifyId",
                "track_name",
                "artists",
              ])
              .insert({
                user_id,
                playlist_id,
                track_spotifyId: spotifyId,
                track_name: name,
                artists,
              })
              .then((songs) => {
                console.log(songs);
                return songs;
              });
          }

          console.log(song);
          console.log(`Song already added ${song}`);
          return {
            song: song[0].track_spotifyId,
            note: "Song already added",
          };
        });

      return res;
    } catch (err) {
      console.log("Something went wrong.");
      console.error(err);
      process.exit(1);
    }
  },
};
