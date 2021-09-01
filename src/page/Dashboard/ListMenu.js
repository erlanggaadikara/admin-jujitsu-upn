import { observer, useLocalObservable } from "mobx-react-lite";
import { action } from "mobx";
import { List, ListItem, ListItemText, Divider } from "@material-ui/core";

export const menu = [
  {
    name: "Beranda",
    path: "/",
    component: require("page/Dashboard/Home"),
  },
];

export default observer(() => {
  return (
    <>
      <List>
        {menu.map((item) => (
          <ListItem button key={item.path}>
            <ListItemText primary={item.name} />
          </ListItem>
        ))}
      </List>
    </>
  );
});
