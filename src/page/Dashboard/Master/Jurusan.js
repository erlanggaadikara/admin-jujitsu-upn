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
import { Get } from "utils/api";
import { useEffect, useState, useRef } from "react";
import { useFormik } from "formik";
import * as yup from "yup";
import Spinner from "component/Spinner";

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
      const jurusan = await Get("/jurusan");
      const fakultas = await Get("/fakultas");
      if (jurusan && fakultas) {
        let columns = [
          {
            field: "jurusan_nama",
            headerName: "Nama",
            minWidth: 300,
          },
          {
            field: "fakultas_id",
            headerName: "Fakultas",
            minWidth: 300,
            valueGetter: (params) => {
              const checkFakultas = fakultas.find((x) => x.id == params.value);
              return checkFakultas.fakultas_nama;
            },
          },
          {
            field: "jurusan_status",
            headerName: "Status",
            minWidth: 150,
            valueGetter: (params) =>
              params.value == 1 ? "Aktif" : "Non Aktif",
          },
        ];

        setColumns([...columns]);
        setRows([...jurusan]);

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
          Jurusan
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
                    jurusan_nama: "",
                    jurusan_id: 2,
                    jurusan_status: 1,
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
  const meta = useLocalObservable(() => ({
    fakultas: [],
  }));
  const validationSchema = yup.object({
    jurusan_nama: yup.string().required("Mohon diisi"),
    fakultas_id: yup.number().required("Mohon diisi"),
    jurusan_status: yup.number().required("Mohon diisi"),
  });

  const formik = useFormik({
    initialValues: {
      jurusan_nama: data.jurusan_nama,
      fakultas_id: data.fakultas_id,
      jurusan_status: data.jurusan_status,
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      await submitEvent(data.type, values);
    },
  });

  const createNew = async (value) => {
    console.log("new", value);
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

  useEffect(() => {
    const fetch = async () => {
      const fakultas = await Get("/fakultas");
      if (fakultas) {
        runInAction(() => {
          meta.fakultas = fakultas;
        });
      }
    };

    fetch();
  }, []);

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
        label="Nama jurusan *"
        name="jurusan_nama"
        variant="outlined"
        color="primary"
        fullWidth
        value={formik.values.jurusan_nama}
        onChange={formik.handleChange}
        error={
          formik.touched.jurusan_nama && Boolean(formik.errors.jurusan_nama)
        }
        helperText={formik.touched.jurusan_nama && formik.errors.jurusan_nama}
        sx={{ my: 1, mr: 1, width: { laptop: "45%", mobile: "90%" } }}
      />
      <FormControl
        fullWidth
        sx={{ my: 1, mr: 1, width: { laptop: "45%", mobile: "90%" } }}
        error={formik.touched.fakultas_id && Boolean(formik.errors.fakultas_id)}
      >
        <InputLabel id="demo-simple-select-helper-label">Fakultas *</InputLabel>
        <Select
          labelId="demo-simple-select-helper-label"
          label="Status *"
          name="fakultas_id"
          value={formik.values.fakultas_id}
          onChange={formik.handleChange}
          color="primary"
        >
          {meta.fakultas.map((item) => (
            <MenuItem key={item.id} value={item.id}>
              {item.fakultas_nama}
            </MenuItem>
          ))}
        </Select>
        <FormHelperText>
          {formik.touched.fakultas_id && formik.errors.fakultas_id}
        </FormHelperText>
      </FormControl>
      <FormControl
        fullWidth
        sx={{ my: 1, mr: 1, width: { laptop: "45%", mobile: "90%" } }}
        error={
          formik.touched.jurusan_status && Boolean(formik.errors.jurusan_status)
        }
      >
        <InputLabel id="demo-simple-select-helper-label">Status *</InputLabel>
        <Select
          labelId="demo-simple-select-helper-label"
          label="Status *"
          name="jurusan_status"
          value={formik.values.jurusan_status}
          onChange={formik.handleChange}
          color="primary"
        >
          <MenuItem value={0}>Non Aktif</MenuItem>
          <MenuItem value={1}>Aktif</MenuItem>
        </Select>
        <FormHelperText>
          {formik.touched.jurusan_status && formik.errors.jurusan_status}
        </FormHelperText>
      </FormControl>
      <Button sx={{ display: "none" }} type="submit" ref={formRef} />
    </Box>
  );
});
