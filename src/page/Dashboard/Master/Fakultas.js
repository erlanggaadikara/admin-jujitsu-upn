import { observer, useLocalObservable } from "mobx-react-lite";
import { action, observable, runInAction } from "mobx";
import {
  Box,
  Typography,
  TextField,
  Button,
  FormHelperText,
  Select,
  InputLabel,
  FormControl,
  MenuItem,
} from "@material-ui/core";
import { DataGrid } from "@mui/x-data-grid";
import { Get, Post } from "utils/api";
import { useEffect, useState, useRef } from "react";
import { useFormik } from "formik";
import * as yup from "yup";
import Spinner from "component/Spinner";
import { toast } from "component/Show/Toast";

export default observer(() => {
  const meta = useLocalObservable(() => ({
    value: "",
    load: true,
  }));
  const [columns, setColumns] = useState([]);
  const [rows, setRows] = useState([]);

  const form = useRef(null);

  useEffect(() => {
    const fetch = async () => {
      const fakultas = await Get("/fakultas");
      if (fakultas) {
        let columns = [
          {
            field: "fakultas_nama",
            headerName: "Nama",
            minWidth: 300,
          },
          {
            field: "fakultas_status",
            headerName: "Status",
            minWidth: 150,
            valueGetter: (params) =>
              params.value == 1 ? "Aktif" : "Non Aktif",
          },
        ];

        setColumns([...columns]);
        setRows([...fakultas]);

        runInAction(() => {
          meta.load = false;
        });
      }
    };

    fetch();
  }, []);

  if (meta.load) return <Spinner />;

  return (
    <Box sx={{ height: "90vh", display: "flex", flexDirection: "column" }}>
      <Box
        sx={{
          width: "100%",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <Typography variant="h5" sx={{ my: 2 }}>
          Fakultas
        </Typography>
        {meta.value ? (
          <Box
            sx={{
              display: "flex",
              flex: 1,
              flexDirection: "row",
              justifyContent: "flex-end",
            }}
          >
            <Button
              variant="contained"
              color="success"
              size="medium"
              sx={{ my: 2, px: 4, mr: 1 }}
              onClick={() => form.current && form.current.click()}
            >
              Simpan
            </Button>
            <Button
              variant="contained"
              color="error"
              size="medium"
              sx={{ my: 2, px: 4, mr: 1 }}
              type="button"
              onClick={action(() => (meta.value = ""))}
            >
              Cancel
            </Button>
          </Box>
        ) : (
          <Box
            sx={{
              display: "flex",
              flex: 1,
              flexDirection: "row",
              justifyContent: "flex-end",
            }}
          >
            <Button
              variant="contained"
              color="success"
              size="medium"
              sx={{ my: 2, px: 4, mr: 1 }}
              onClick={action(
                () =>
                  (meta.value = {
                    type: "new",
                    fakultas_nama: "",
                    fakultas_status: 1,
                  })
              )}
            >
              Baru
            </Button>
          </Box>
        )}
      </Box>
      {!meta.value ? (
        <DataGrid
          rows={rows}
          columns={columns}
          onCellClick={action(
            (params) => (meta.value = { type: "update", ...params.row })
          )}
        />
      ) : (
        <FormField data={meta.value} formRef={form} />
      )}
    </Box>
  );
});

const FormField = observer(({ data, formRef }) => {
  const validationSchema = yup.object({
    fakultas_nama: yup.string().required("Mohon diisi"),
    fakultas_status: yup.number().required("Mohon diisi"),
  });

  const formik = useFormik({
    initialValues: {
      fakultas_nama: data.fakultas_nama,
      fakultas_status: data.fakultas_status,
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      await submitEvent(data.type, values);
    },
  });

  const createNew = async (value) => {
    console.log(value);
    const cn = await Post("/fakultas/insert", {
      ...value,
      nama_fakultas: value.fakultas_nama,
    });

    console.log("new", cn);
    if (cn) {
      toast.show("Berhasil", "Input Data Berhasil", "SUCCESS");
    } else {
      toast.show("Gagal", "Input Data Gagal", "ERROR");
    }
  };

  const updateData = async (value) => {
    console.log("update", value);
  };

  const deleteData = async (value) => {
    console.log("delete", value);
  };

  const submitEvent = async (type, value) => {
    if (type == "new") {
      await createNew(value);
    } else if (type == "update") {
      await updateData(value);
    }
  };

  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: "row",
        flexWrap: "wrap",
      }}
      component="form"
      onSubmit={formik.handleSubmit}
    >
      <TextField
        label="Nama Fakultas *"
        name="fakultas_nama"
        variant="outlined"
        color="primary"
        fullWidth
        value={formik.values.fakultas_nama}
        onChange={formik.handleChange}
        error={
          formik.touched.fakultas_nama && Boolean(formik.errors.fakultas_nama)
        }
        helperText={formik.touched.fakultas_nama && formik.errors.fakultas_nama}
        sx={{ my: 1, mr: 1, width: { laptop: "45%", mobile: "90%" } }}
      />
      <FormControl
        fullWidth
        sx={{ my: 1, mr: 1, width: { laptop: "45%", mobile: "90%" } }}
        error={
          formik.touched.fakultas_status &&
          Boolean(formik.errors.fakultas_status)
        }
      >
        <InputLabel id="demo-simple-select-helper-label">Status *</InputLabel>
        <Select
          labelId="demo-simple-select-helper-label"
          label="Status *"
          name="fakultas_status"
          value={formik.values.fakultas_status}
          onChange={formik.handleChange}
          color="primary"
        >
          <MenuItem value={0}>Non Aktif</MenuItem>
          <MenuItem value={1}>Aktif</MenuItem>
        </Select>
        <FormHelperText>
          {formik.touched.fakultas_status && formik.errors.fakultas_status}
        </FormHelperText>
      </FormControl>
      <Button sx={{ display: "none" }} type="submit" ref={formRef} />
    </Box>
  );
});
