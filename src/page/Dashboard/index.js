import { observer, useLocalObservable } from "mobx-react-lite";
import { action } from "mobx";
import { Drawer, Box, IconButton } from "@material-ui/core";
import MenuIcon from "@material-ui/icons/Menu";
import { Router } from "@reach/router";
import ListMenu, { menu } from "./ListMenu";
import { createElement } from "react";
import Home from "page/Dashboard/Home";

export default observer(() => {
  const meta = useLocalObservable(() => ({
    openDrawer: false,
    container: window !== undefined ? () => window.document.body : undefined,
  }));

  return (
    <Box sx={{ display: "flex" }}>
      <Box
        sx={{
          position: "fixed",
          width: { tablet: "calc(100% - 240px)" },
          ml: { tablet: "240px" },
        }}
      >
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={action(() => (meta.openDrawer = true))}
          sx={{ mr: 2, display: { tablet: "none" } }}
        >
          <MenuIcon />
        </IconButton>
      </Box>
      <Box
        component="nav"
        sx={{ width: { tablet: 240 }, flexShrink: { tablet: 0 } }}
      >
        <Drawer
          container={meta.container}
          variant="temporary"
          open={meta.openDrawern}
          onClose={action(() => (meta.openDrawer = false))}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { mobile: "block", tablet: "none" },
            "& .MuiDrawer-paper": { boxSizing: "border-box", width: 240 },
          }}
        >
          <ListMenu />
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { mobile: "none", tablet: "block" },
            "& .MuiDrawer-paper": { boxSizing: "border-box", width: 240 },
          }}
          open
        >
          <ListMenu />
        </Drawer>
      </Box>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Router>
          <Home path="/" />
        </Router>
      </Box>
    </Box>
  );
});
