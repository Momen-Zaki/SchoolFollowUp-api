const express = require("express");
const app = express();
const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
var cors = require("cors");
require("./mongodb/db");

app.use(cors());
require("./routes/auth.routes")(app);
require("./routes/classroom.routes")(app);
require("./routes/comment.routes")(app);
require("./routes/notification.routes")(app);
require("./routes/post.routes")(app);
require("./routes/staff_member.routes")(app);
require("./routes/student.routes")(app);
require("./routes/subscribtion.routes")(app);
require("./routes/user.routes")(app);
require("./routes/daily_eval.routes")(app);
require("./routes/weekly_eval.routes")(app);
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
