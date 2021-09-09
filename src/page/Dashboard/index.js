import { observer, useLocalObservable } from "mobx-react-lite";
import { action } from "mobx";
import {
  Drawer,
  Box,
  IconButton,
  CssBaseline,
  Toolbar,
  useMediaQuery,
} from "@material-ui/core";
import MenuIcon from "@material-ui/icons/Menu";
import { Router, navigate } from "@reach/router";
import ListMenu, { menu } from "./ListMenu";
import { createElement, useEffect } from "react";
import Container from "component/Container";
import store from "utils/store";

export default observer(() => {
  const isMobile = useMediaQuery("(max-width:640px)");
  const meta = useLocalObservable(() => ({
    openDrawer: false,
    container: window !== undefined ? () => window.document.body : undefined,
  }));

  useEffect(() => {
    if (!store.view("session")) {
      navigate("/", { replace: true });
    }
    window.session = store.view("session");
  }, []);

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <Box
        sx={{
          position: "fixed",
          width: { tablet: "calc(100% - 240px)" },
          ml: { tablet: "240px" },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={action(() => (meta.openDrawer = true))}
            sx={{ mr: 2, display: { tablet: "none" } }}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </Box>
      <Box
        component="nav"
        sx={{ width: { tablet: 240 }, flexShrink: { tablet: 0 } }}
      >
        <Drawer
          container={meta.container}
          variant="temporary"
          open={meta.openDrawer}
          onClose={action(() => (meta.openDrawer = false))}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { mobile: "block", tablet: "none" },
            "& .MuiDrawer-paper": { boxSizing: "border-box", width: 240 },
          }}
        >
          <ListMenu closeDrawer={action(() => (meta.openDrawer = false))} />
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { mobile: "none", tablet: "block" },
            "& .MuiDrawer-paper": { boxSizing: "border-box", width: 240 },
          }}
          open
        >
          <ListMenu closeDrawer={() => null} />
        </Drawer>
      </Box>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        {isMobile && <Toolbar />}
        <Container>
          <Router>
            {menu.map((item) => {
              if (item.component) {
                return createElement(item.component, { path: item.path }, null);
              } else if (item.child) {
                return item.child.map((val) =>
                  createElement(
                    val.component,
                    { path: item.path + val.path },
                    null
                  )
                );
              }
            })}
          </Router>
        </Container>
      </Box>
    </Box>
  );
});
