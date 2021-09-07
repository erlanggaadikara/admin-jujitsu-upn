import { Box, Typography, Modal } from "@material-ui/core";
import { observable, makeObservable, action } from "mobx";
import { observer } from "mobx-react-lite";

class AlertModel {
  open = false;
  title = "";
  message = "";

  constructor() {
    makeObservable(this, {
      open: observable,
      title: observable,
      message: observable,
      show: action,
      close: action,
    });
  }

  show = (title, message = "") => {
    this.message = message;
    this.title = title;
    this.open = true;
  };

  close = () => {
    this.message = "";
    this.title = "";
    this.open = false;
  };
}

export const alert = new AlertModel();
window.alert = alert;

export default observer(() => {
  return (
    <Modal
      open={alert.open}
      onClose={alert.close}
      sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      <Box
        sx={{
          borderRadius: 3,
          bgcolor: "primary.light",
          width: { laptop: "60%", mobile: "70%" },
          height: "30%",
          p: 3,
          display: "flex",
          justifyContent: "space-between",
          flexDirection: "column",
        }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: "700" }}>
            {alert.title}
          </Typography>
          <Typography variant="h6" sx={{ margin: "10px 0" }}>
            {alert.message}
          </Typography>
        </Box>
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "flex-end",
          }}
        >
          <Typography
            variant="h6"
            sx={{ margin: "0 20px", cursor: "pointer", color: "primary.main" }}
            onClick={alert.close}
          >
            OK
          </Typography>
        </Box>
      </Box>
    </Modal>
  );
});
