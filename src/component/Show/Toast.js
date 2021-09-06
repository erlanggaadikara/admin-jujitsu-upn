import React, { useContext, useEffect } from "react";
import { observer } from "mobx-react-lite";
import { observable, action, makeObservable } from "mobx";
import { Snackbar, Typography, IconButton, Box } from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import { AddBoxRounded } from "@material-ui/icons";

class ToastModel {
  open = false;
  title = "";
  message = "";
  color = "#383B4A";

  constructor() {
    makeObservable(this, {
      open: observable,
      title: observable,
      message: observable,
      show: action,
      close: action,
    });
  }

  show = (title, message, type) => {
    this.message = message;
    this.title = title;
    this.open = true;

    type =
      type === "SUCCESS"
        ? (this.color = "#4acc17")
        : type === "ERROR" && (this.color = "#CC4217");
  };

  close = () => {
    this.message = "";
    this.title = "";
    this.open = false;
    this.color = "#383B4A";
  };
}

export const toast = new ToastModel();

export default observer(() => {
  return (
    <Snackbar
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
      open={toast.open}
      onClose={toast.close}
      autoHideDuration={10000}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          padding: 20,
          minWidth: 300,
          backgroundColor: toast.color,
          color: "white",
          borderRadius: 10,
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="title">{toast.title}</Typography>
          <IconButton
            size="small"
            color="inherit"
            onClick={toast.close}
            sx={{ alignSelf: "flex-end" }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
        <Typography variant="h6" sx={{ display: "inline-block" }}>
          {toast.message}
        </Typography>
      </div>
    </Snackbar>
  );
});
