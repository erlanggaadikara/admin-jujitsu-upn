import { observer, useLocalObservable } from "mobx-react-lite";
import { action, runInAction } from "mobx";
import {
  Box,
  Typography,
  TextField,
  Button,
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

const KEY = "/Master/Fakultas";

export default observer(() => {
  const isMobile = useMediaQuery("(max-width:640px)");
  const meta = useLocalObservable(() => ({
    value: "",
    saving: false,
    quickAccess: false,
    load: true,
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
      const fakultas = await Get("/fakultas");
      if (fakultas) {
        let columns = [
          {
            field: "fakultas_nama",
            headerName: "Nama",
            minWidth: 300,
          },
        ];

        setColumns([...columns]);
        setRows([...fakultas]);

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
          onClick={action(() => (meta.value = ""))}
          sx={{ display: !meta.value && "none" }}
        >
          <ArrowBack />
        </IconButton>
        <Typography variant="h5" sx={{ my: 2 }}>
          Fakultas
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
        <Box
          sx={{
            display: meta.value ? "flex" : "none",
            flex: 1,
            flexDirection: "row",
            justifyContent: "flex-end",
          }}
        >
          <LoadingButton
            variant="contained"
            color="success"
            size="medium"
            sx={{ my: 2, px: { laptop: 4 }, mr: 1 }}
            startIcon={<Save />}
            loading={global.saving}
            loadingPosition="start"
            onClick={action(() => {
              form.current && form.current.click();
            })}
          >
            {isMobile ? "" : "Simpan"}
          </LoadingButton>
          {meta.value.type !== "new" && (
            <LoadingButton
              variant="contained"
              color="error"
              size="medium"
              loading={global.removing}
              loadingPosition="start"
              sx={{ my: 2, px: { laptop: 4 }, mr: 1 }}
              type="button"
              startIcon={<Delete />}
              onClick={action(() => {
                del.current && del.current.click();
                meta.value = "";
              })}
            >
              {isMobile ? "" : "Hapus"}
            </LoadingButton>
          )}
        </Box>
        <Box
          sx={{
            display: !meta.value ? "flex" : "none",
            flex: 1,
            flexDirection: "row",
            justifyContent: "flex-end",
          }}
        >
          <Button
            variant="contained"
            color="success"
            size="medium"
            sx={{ my: 2, px: { laptop: 4 }, mr: 1 }}
            startIcon={<Add />}
            onClick={action(
              () =>
                (meta.value = {
                  type: "new",
                  nama_fakultas: "",
                  status_fakultas: 1,
                })
            )}
          >
            {isMobile ? "" : "Baru"}
          </Button>
        </Box>
      </Box>
      {!meta.value ? (
        <DataGrid
          rows={rows}
          loading={meta.load}
          columns={columns}
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
  const validationSchema = yup.object({
    nama_fakultas: yup.string().required("Mohon diisi"),
  });

  const formik = useFormik({
    initialValues: {
      nama_fakultas: data.fakultas_nama,
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      global.saving = true;
      await submitEvent(data.type, values);
    },
  });

  const createNew = async (value) => {
    const cn = await Post("/fakultas/insert", value);

    if (cn) {
      window.toast.show("Berhasil", "Input Data Berhasil", "SUCCESS");
    } else {
      window.toast.show("Gagal", "Input Data Gagal", "ERROR");
    }
  };

  const updateData = async (value) => {
    const cn = await Post("/fakultas/update", { id: data.id, ...value });

    if (cn) {
      window.toast.show("Berhasil", "Update Data Berhasil", "SUCCESS");
    } else {
      window.toast.show("Gagal", "Update Data Gagal", "ERROR");
    }
  };

  const deleteData = async () => {
    global.removing = true;
    const cn = await Post("/fakultas/delete", {
      id: data.id,
    });

    if (cn) {
      window.toast.show("Berhasil", "Hapus Data Berhasil", "SUCCESS");
    } else {
      window.toast.show("Gagal", "Hapus Data Gagal", "ERROR");
    }

    global.removing = false;
  };

  const submitEvent = async (type, value) => {
    if (type == "new") {
      await createNew(value);
    } else if (type == "update") {
      await updateData(value);
    }
    global.saving = false;
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
        name="nama_fakultas"
        variant="outlined"
        color="primary"
        fullWidth
        value={formik.values.nama_fakultas}
        onChange={formik.handleChange}
        error={
          formik.touched.nama_fakultas && Boolean(formik.errors.nama_fakultas)
        }
        helperText={formik.touched.nama_fakultas && formik.errors.nama_fakultas}
        sx={{ my: 1, mr: 1, width: { laptop: "45%", mobile: "90%" } }}
      />
      <Button sx={{ display: "none" }} type="submit" ref={formRef.form} />
      <Button sx={{ display: "none" }} ref={formRef.del} onClick={deleteData} />
    </Box>
  );
});
