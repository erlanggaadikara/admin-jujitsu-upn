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

const KEY = "/Master/Jabatan";

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
      const jabatan = await Get("/jabatan");
      if (jabatan) {
        let columns = [
          {
            field: "jabatan_nama",
            headerName: "Nama",
            minWidth: 400,
          },
        ];

        setColumns([...columns]);
        setRows([...jabatan]);

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
          Jabatan
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
  const validationSchema = yup.object({
    nama_jabatan: yup.string().required("Mohon diisi"),
  });

  const formik = useFormik({
    initialValues: {
      nama_jabatan: data.jabatan_nama,
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      global.saving = true;
      await submitEvent(data.type, values);
    },
  });

  const createNew = async (value) => {
    const cn = await Post("/jabatan/insert", value);

    if (cn) {
      window.toast.show("Berhasil", "Input Data Berhasil", "SUCCESS");
    } else {
      window.toast.show("Gagal", "Input Data Gagal", "ERROR");
    }
  };

  const updateData = async (value) => {
    const cn = await Post("/jabatan/update", { id: data.id, ...value });

    if (cn) {
      window.toast.show("Berhasil", "Update Data Berhasil", "SUCCESS");
    } else {
      window.toast.show("Gagal", "Update Data Gagal", "ERROR");
    }
  };

  const deleteData = async () => {
    global.removing = true;
    const cn = await Post("/jabatan/delete", {
      id: data.id,
    });

    if (cn) {
      window.toast.show("Berhasil", "Hapus Data Berhasil", "SUCCESS");
    } else {
      window.toast.show("Gagal", "Hapus Data Gagal", "ERROR");
    }
    global.removing = true;
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
        label="Nama jabatan *"
        name="nama_jabatan"
        variant="outlined"
        color="primary"
        fullWidth
        value={formik.values.nama_jabatan}
        onChange={formik.handleChange}
        error={
          formik.touched.nama_jabatan && Boolean(formik.errors.nama_jabatan)
        }
        helperText={formik.touched.nama_jabatan && formik.errors.nama_jabatan}
        sx={{ my: 1, mr: 1, width: { laptop: "45%", mobile: "90%" } }}
      />
      <Button sx={{ display: "none" }} type="submit" ref={formRef.form} />
      <Button sx={{ display: "none" }} ref={formRef.del} onClick={deleteData} />
    </Box>
  );
});
