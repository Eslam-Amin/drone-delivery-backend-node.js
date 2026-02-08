import app from "./app";
import { config } from "./config/env.config";

app.listen(config.port, () => {
  console.log(`Server is running on port ${config.port}`);
});
