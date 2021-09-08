import { observer } from "mobx-react-lite";
import { Box, Link, Typography, Divider } from "@material-ui/core";
import { menu } from "./ListMenu";
import { navigate } from "@reach/router";

export default observer(() => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", flex: 1 }}>
      <Box sx={{ display: "flex", flexDirection: "row" }}>
        <Typography variant="h6" sx={{ my: 2 }}>
          Halo Erlangga, Alumni UPN Veteran Jawa Timur
        </Typography>
      </Box>
      <Divider />
      <Typography variant="body2" sx={{ mt: 2, fontWeight: "lighter" }}>
        Quick Access
      </Typography>
      <Box
        sx={{ display: "flex", flexDirection: "row", my: 2, overflowX: "auto" }}
      >
        {menu.map(
          (item) =>
            item.component && (
              <Link href={"/Dashboard" + item.path}>
                <Box
                  sx={{
                    border: 1,
                    borderRadius: 1,
                    borderColor: "primary.main",
                    width: 200,
                    height: 200,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    m: 1,
                  }}
                >
                  <Typography variant="h6">{item.name}</Typography>
                </Box>
              </Link>
            )
        )}
      </Box>
    </Box>
  );
});
