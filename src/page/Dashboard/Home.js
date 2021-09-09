import { observer } from "mobx-react-lite";
import { Box, Typography, Divider, Button } from "@material-ui/core";
import { menu } from "./ListMenu";
import { navigate, Link } from "@reach/router";

export default observer(() => {
  const quick = window.store.view("Quick");
  return (
    <Box sx={{ display: "flex", flexDirection: "column", flex: 1 }}>
      <Box sx={{ display: "flex", flexDirection: "row" }}>
        <Typography variant="h6" sx={{ my: 2 }}>
          Halo {window.session.username}, {window.session.title}
        </Typography>
      </Box>
      <Divider />
      <Typography variant="body2" sx={{ mt: 2, fontWeight: "lighter" }}>
        Quick Access
      </Typography>
      <Box
        flexWrap="wrap"
        sx={{ display: "flex", flexDirection: "row", my: 2, overflowX: "auto" }}
      >
        {Array.isArray(quick) &&
          quick.map((item) => {
            const str = item.split("/");
            return (
              <Button onClick={() => navigate("/Dashboard" + item)}>
                {`${str[1]} ${str[2] || ""}`}
              </Button>
            );
          })}
      </Box>
    </Box>
  );
});
