require("dotenv").config();
const http = require("http");
const { connectdb } = require("./db");
const query = require("querystring");
const { ObjectId } = require("mongodb");

const backendserver = async () => {
  const database = await connectdb();

  const server = http.createServer(async (req, res) => {
    /* ----------------------------this is get API ------------------------------------- */

    if (req.method === "GET") {
      try {
        const user = await database.collection("user").find().toArray();
        if (user.length === 0) {
          const msg = JSON.stringify({
            message: "User not found",
          });
          res.writeHead(404, {
            "content-type": "application/json",
          });
          res.write(msg);
          res.end();
        } else {
          res.writeHead(200, {
            "content-type": "application/json",
          });
          res.write(JSON.stringify(user));
          res.end();
        }
      } catch (error) {
        const msg = JSON.stringify({
          message: "Internal server error",
        });
        res.writeHead(500, {
          "content-type": "application/json",
        });
        res.write(msg);
        res.end();
      }
    }

    // -------------------------this is post API----------------------------------------
    else if (req.method === "POST") {
      try {
        let data = "";
        req.on("data", (chunks) => {
          data += chunks;
        });
        req.on("end", async () => {
          const uservalue = query.parse(data);
          const queryValue = {
            name: uservalue.name,
            mobile: uservalue.mobile,
          };
          const existuser = await database
            .collection("user")
            .findOne(queryValue);
          if (!existuser) {
            await database.collection("user").insertOne(uservalue);
            const msg = JSON.stringify({
              message: "Data is added successfully",
            });
            res.writeHead(201, {
              "content-type": "application/json",
            });
            res.write(msg);
            res.end();
          } else {
            const msg = JSON.stringify({
              message: "User already exist",
            });
            res.writeHead(409, {
              "content-type": "application/json",
            });
            res.write(msg);
            res.end();
          }
        });
      } catch (error) {
        const msg = JSON.stringify({
          message: "Internal server error",
        });
        res.writeHead(500, {
          "content-type": "application/json",
        });
        res.write(msg);
        res.end();
      }
    } else if (req.method === "PUT") {
      /* --------------------------------------this is PUT API-------------------------------------------------- */
      try {
        let updatedata = "";
        req.on("data", (chunks) => {
          updatedata += chunks;
        });
        req.on("end", async () => {
          const Id = req.url.replace("/?", "");
          const updatedvalue = await query.parse(updatedata);
          if (!ObjectId.isValid(Id)) {
            const msg = JSON.stringify({
              message: "Inavlid user ",
            });
            res.writeHead(404, {
              "content-type": "application/json",
            });
            res.write(msg);
            return res.end();
          }
          const id = new ObjectId(Id);
          const updateQuery = {
            _id: id,
          };
          const updateUser = {
            $set: updatedvalue,
          };
          const result = await database
            .collection("user")
            .updateOne(updateQuery, updateUser);
          if (result.matchedCount === 0) {
            const msg = JSON.stringify({
              message: "User not matched in database",
            });
            res.writeHead(404, {
              "content-type": "application/json",
            });
            res.write(msg);
            return res.end();
          } else {
            const msg = JSON.stringify({
              message: "User updated successfully",
            });
            res.writeHead(200, {
              "content-type": "application/json",
            });
            res.write(msg);
            return res.end();
          }
        });
      } catch (error) {
        const msg = JSON.stringify({
          message: "Internal server error",
        });
        res.writeHead(500, {
          "content-type": "application/json",
        });
        res.write(msg);
        res.end();
      }
    }

    // -----------------------------------------------This is delete API---------------------------------------------
    else if (req.method === "DELETE") {
      try {
        const deleteid = req.url.replace("/?", "");
        if (!ObjectId.isValid(deleteid)) {
          const msg = JSON.stringify({
            message: "Invalid User ",
          });
          res.writeHead(404, {
            "content-type": "application/json",
          });
          res.write(msg);
          return res.end();
        }
        const Id = new ObjectId(deleteid);
        const deleteQuery = {
          _id: Id,
        };
        const result = await database.collection("user").deleteOne(deleteQuery);
        if (result.deletedCount === 0) {
          const msg = JSON.stringify({
            message: "User not matched in database",
          });
          res.writeHead(404, {
            "content-type": "application/json",
          });
          res.write(msg);
          return res.end();
        } else {
          const msg = JSON.stringify({
            message: "User deleted successfully",
          });
          res.writeHead(200, {
            "content-type": "application/json",
          });
          res.write(msg);
          return res.end();
        }
      } catch (error) {
        const msg = JSON.stringify({
          message: "Internal server error",
        });
        res.writeHead(500, {
          "content-type": "application/json",
        });
        res.write(msg);
        res.end();
      }
    } else {
      const msg = JSON.stringify({
        message: "Bad request",
      });
      res.writeHead(400, {
        "content-type": "application/json",
      });
      res.write(msg);
      res.end();
    }
  });

  server.listen(process.env.Port, (error) => {
    if (error) throw error;

    console.log("server is running ...");
  });
};

backendserver();
