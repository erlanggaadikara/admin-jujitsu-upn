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
  IconButton,
  useMediaQuery,
  Tooltip,
} from "@material-ui/core";
import { DataGrid } from "@mui/x-data-grid";
import { Get, Post } from "utils/api";
import { useEffect, useState, useRef } from "react";
import { useFormik } from "formik";
import * as yup from "yup";
import { LoadingButton } from "@material-ui/lab";
import {
  Save,
  ArrowBack,
  Add,
  Delete,
  AccessTimeSharp,
} from "@material-ui/icons";

const KEY = "/Master/Jurusan";

export default observer(() => {
  const isMobile = useMediaQuery("(max-width:640px)");
  const meta = useLocalObservable(() => ({
    value: "",
    load: true,
    quickAccess: false,
  }));
  const [columns, setColumns] = useState([]);
  const [rows, setRows] = useState([]);

  const form = useRef(null);
  const del = useRef(null);

  const quickAccess = action(() => {
    meta.quickAccess = window.global.quickAccess(KEY);
  });

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
        ];

        setColumns([...columns]);
        setRows([...jurusan]);

        runInAction(() => {
          meta.load = false;
        });
      }
    };

    runInAction(() => {
      meta.quickAccess = window.global.checkQuickAccess(KEY);
    });

    fetch();
  }, [meta.value]);

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
        <IconButton
          aria-label="back"
          sx={{ display: !meta.value && "none" }}
          onClick={action(() => (meta.value = ""))}
        >
          <ArrowBack />
        </IconButton>
        <Typography variant="h5" sx={{ my: 2 }}>
          Jurusan
        </Typography>
        <Tooltip title={`Quick Access ${meta.quickAccess ? "On" : "Off"}`}>
          <IconButton
            onClick={quickAccess}
            sx={{ display: meta.value && "none" }}
          >
            <AccessTimeSharp
              color={meta.quickAccess ? "primary" : ""}
              fontSize="small"
            />
          </IconButton>
        </Tooltip>
        {meta.value ? (
          <Box
            sx={{
              display: "flex",
              flex: 1,
              flexDirection: "row",
              justifyContent: "flex-end",
            }}
          >
            <LoadingButton
              variant="contained"
              color="success"
              size="medium"
              sx={{ my: 2, px: 4, mr: 1 }}
              startIcon={<Save />}
              loading={global.saving}
              loadingPosition="start"
              onClick={() => {
                form.current && form.current.click();
              }}
            >
              {isMobile ? "" : "Simpan"}
            </LoadingButton>
            {meta.value.type !== "new" && (
              <Button
                variant="contained"
                color="error"
                size="medium"
                sx={{ my: 2, px: 4, mr: 1 }}
                type="button"
                startIcon={<Delete />}
                onClick={action(() => {
                  del.current && del.current.click();
                  meta.value = "";
                })}
              >
                {isMobile ? "" : "Hapus"}
              </Button>
            )}
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
              startIcon={<Add />}
              onClick={action(
                () =>
                  (meta.value = {
                    type: "new",
                  })
              )}
            >
              {isMobile ? "" : "Baru"}
            </Button>
          </Box>
        )}
      </Box>
      {!meta.value ? (
        <DataGrid
          rows={rows}
          columns={columns}
          loading={meta.load}
          onCellClick={action(
            (params) => (meta.value = { type: "update", ...params.row })
          )}
        />
      ) : (
        <FormField data={meta.value} formRef={{ form, del }} />
      )}
    </Box>
  );
});

const FormField = observer(({ data, formRef }) => {
  const meta = useLocalObservable(() => ({
    fakultas: [],
  }));
  const validationSchema = yup.object({
    nama_jurusan: yup.string().required("Mohon diisi"),
    fakultas_id: yup.number().required("Mohon diisi"),
  });

  const formik = useFormik({
    initialValues: {
      nama_jurusan: data.jurusan_nama,
      fakultas_id: data.fakultas_id,
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      global.saving = true;
      await submitEvent(data.type, values);
    },
  });

  const createNew = async (value) => {
    const cn = await Post("/jurusan/insert", value);

    if (cn) {
      window.toast.show("Berhasil", "Input Data Berhasil", "SUCCESS");
    } else {
      window.toast.show("Gagal", "Input Data Gagal", "ERROR");
    }
  };

  const updateData = async (value) => {
    const cn = await Post("/jurusan/update", { id: data.id, ...value });

    if (cn) {
      window.toast.show("Berhasil", "Update Data Berhasil", "SUCCESS");
    } else {
      window.toast.show("Gagal", "Update Data Gagal", "ERROR");
    }
  };

  const deleteData = async () => {
    const cn = await Post("/jurusan/delete", {
      id: data.id,
    });

    if (cn) {
      window.toast.show("Berhasil", "Hapus Data Berhasil", "SUCCESS");
    } else {
      window.toast.show("Gagal", "Hapus Data Gagal", "ERROR");
    }
  };

  const submitEvent = async (type, value) => {
    if (type == "new") {
      await createNew(value);
    } else if (type == "update") {
      await updateData(value);
    }
    global.saving = false;
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
        name="nama_jurusan"
        variant="outlined"
        color="primary"
        fullWidth
        value={formik.values.nama_jurusan}
        onChange={formik.handleChange}
        error={
          formik.touched.nama_jurusan && Boolean(formik.errors.nama_jurusan)
        }
        helperText={formik.touched.nama_jurusan && formik.errors.nama_jurusan}
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
      <Button sx={{ display: "none" }} type="submit" ref={formRef.form} />
      <Button sx={{ display: "none" }} ref={formRef.del} onClick={deleteData} />
    </Box>
  );
});
