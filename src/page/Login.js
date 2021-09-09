import { observer } from "mobx-react-lite";
import { useFormik } from "formik";
import { Post } from "utils/api";
import * as yup from "yup";
import { Box, TextField, Typography } from "@material-ui/core";
import { LoadingButton } from "@material-ui/lab";
import Container from "component/Container";
import { navigate } from "@reach/router";
import { useState } from "react";

export default observer(() => {
  const [login, setLogin] = useState(false);

  const validationSchema = yup.object({
    username: yup.string().required("Mohon diisi"),
    password: yup.string().required("Mohon diisi"),
  });

  const formik = useFormik({
    initialValues: {
      username: "",
      password: "",
    },
    validationSchema,
    onSubmit: async (value) => {
      setLogin(true);
      const login = await Post("/login_user", value);
      console.log(login);
      if (login.status === 1) {
        window.store.set("session", login.data);
        window.session = login.data;
        setLogin(false);
        navigate("/Dashboard", { replace: true });
      } else {
        window.toast.show("Gagal", login.message, "ERROR");
      }
      setLogin(false);
    },
  });

  return (
    <Container>
      <Box
        sx={{
          bgcolor: "bg.main",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          p: 2,
          height: "100vh",
        }}
      >
        <img src="asset/image/favicon.png" alt="logo" width={120} />
        <Typography variant="h4" sx={{ my: 2 }}>
          GoAdmin
        </Typography>
        <Box sx={{ mt: 2 }} component="form" onSubmit={formik.handleSubmit}>
          <TextField
            label="Username"
            name="username"
            variant="outlined"
            color="primary"
            fullWidth
            value={formik.values.username}
            onChange={formik.handleChange}
            error={formik.touched.username && Boolean(formik.errors.username)}
            helperText={formik.touched.username && formik.errors.username}
            sx={{ mb: 1 }}
          />
          <TextField
            label="Password"
            type="password"
            name="password"
            variant="outlined"
            color="primary"
            fullWidth
            value={formik.values.password}
            onChange={formik.handleChange}
            error={formik.touched.password && Boolean(formik.errors.password)}
            helperText={formik.touched.password && formik.errors.password}
            sx={{ my: 1 }}
          />
          <LoadingButton
            variant="contained"
            color="primary"
            size="large"
            loading={login}
            sx={{ mt: 5, px: 10, mb: 5 }}
            type="submit"
          >
            Login
          </LoadingButton>
        </Box>
      </Box>
    </Container>
  );
});
