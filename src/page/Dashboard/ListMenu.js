import { observer, useLocalObservable } from "mobx-react-lite";
import { action, runInAction } from "mobx";
import {
  List,
  ListItem,
  ListItemText,
  Divider,
  Typography,
  Box,
  Collapse,
} from "@material-ui/core";
import { navigate } from "@reach/router";
import { ExpandLess, ExpandMore } from "@material-ui/icons/";
import { lazy, useEffect } from "react";

export const menu = [
  {
    name: "Dashboard",
    path: "/",
    component: lazy(() => import("page/Dashboard/Home")),
  },
  {
    name: "Organisasi",
    path: "/Organisasi",
    child: [
      {
        name: "Member",
        path: "/Member",
        component: lazy(() => import("page/Dashboard/Organisasi/Member")),
      },
      {
        name: "Kepengurusan",
        path: "/Kepengurusan",
        component: lazy(() => import("page/Dashboard/Organisasi/Kepengurusan")),
      },
    ],
  },
  {
    name: "Master",
    path: "/Master",
    child: [
      {
        name: "Fakultas",
        path: "/Fakultas",
        component: lazy(() => import("page/Dashboard/Master/Fakultas")),
      },
      {
        name: "Jurusan",
        path: "/Jurusan",
        component: lazy(() => import("page/Dashboard/Master/Jurusan")),
      },
      {
        name: "Jabatan",
        path: "/Jabatan",
        component: lazy(() => import("page/Dashboard/Master/Jabatan")),
      },
    ],
  },
  {
    name: "Setting",
    path: "/Setting",
    child: [
      {
        name: "User",
        path: "/User",
        component: lazy(() => import("page/Dashboard/Setting/User")),
      },
    ],
  },
];

export default observer(({ closeDrawer }) => {
  const meta = useLocalObservable(() => ({
    open: {},
  }));

  useEffect(() => {
    menu.map((item) => {
      if (item.child) {
        runInAction(() => {
          meta.open[item.name] = false;
        });
      }
    });
  }, []);
  return (
    <List>
      <Box sx={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
        <img src="asset/image/favicon.png" alt="logo" width={60} />
        <Typography variant="h5">GoAdmin</Typography>
      </Box>
      {menu.map((item) => {
        if (item.child) {
          return (
            <>
              <ListItem
                button
                onClick={() => {
                  runInAction(() => {
                    meta.open[item.name] = !meta.open[item.name];
                  });
                }}
              >
                <ListItemText primary={item.name} />
                {meta.open[item.name] ? <ExpandLess /> : <ExpandMore />}
              </ListItem>
              <Collapse in={meta.open[item.name]} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {item.child.map((val) => (
                    <ListItem
                      sx={{ pl: 4 }}
                      button
                      onClick={() => {
                        navigate("/Dashboard" + item.path + val.path);
                        closeDrawer();
                      }}
                    >
                      <ListItemText primary={val.name} />
                    </ListItem>
                  ))}
                </List>
              </Collapse>
            </>
          );
        } else {
          return (
            <ListItem
              button
              onClick={() => {
                navigate("/Dashboard" + item.path);
                closeDrawer();
              }}
            >
              <ListItemText primary={item.name} />
            </ListItem>
          );
        }
      })}
      <ListItem
        button
        onClick={() => {
          navigate("/", { replace: true });
        }}
      >
        <ListItemText>Logout</ListItemText>
      </ListItem>
    </List>
  );
});
