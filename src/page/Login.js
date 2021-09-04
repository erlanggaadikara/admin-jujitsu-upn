import { observer, useLocalObservable } from "mobx-react-lite";
import { action, runInAction } from "mobx";
import { useFormik } from "formik";
import * as yup from "yup";
import { Box, Button, TextField, Typography } from "@material-ui/core";
import Container from "component/Container";
import { navigate } from "@reach/router";

export default observer(() => {
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
    onSubmit: (value) => {
      console.log(value);
      navigate("/Dashboard", { replace: true });
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
          <Button
            variant="contained"
            color="primary"
            size="large"
            sx={{ mt: 5, px: 10, mb: 5 }}
            type="submit"
          >
            Login
          </Button>
        </Box>
      </Box>
    </Container>
  );
});
