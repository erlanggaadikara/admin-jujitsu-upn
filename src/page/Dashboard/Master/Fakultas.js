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
} from "@material-ui/core";
import { DataGrid } from "@mui/x-data-grid";
import { Get, Post } from "utils/api";
import { useEffect, useState, useRef } from "react";
import { useFormik } from "formik";
import * as yup from "yup";
import Spinner from "component/Spinner";
import { toast } from "component/Show/Toast";
import { LoadingButton } from "@material-ui/lab";
import { Save, ArrowBack, Add, Delete } from "@material-ui/icons";

export default observer(() => {
  const meta = useLocalObservable(() => ({
    value: "",
    load: true,
  }));
  const [columns, setColumns] = useState([]);
  const [rows, setRows] = useState([]);

  const form = useRef(null);
  const del = useRef(null);

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
        {meta.value && (
          <IconButton
            aria-label="back"
            onClick={action(() => (meta.value = ""))}
          >
            <ArrowBack />
          </IconButton>
        )}
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
            <LoadingButton
              variant="contained"
              color="success"
              size="medium"
              sx={{ my: 2, px: 4, mr: 1 }}
              startIcon={<Save />}
              onClick={() => form.current && form.current.click()}
            >
              Simpan
            </LoadingButton>
            {meta.value.type !== "new" && (
              <Button
                variant="contained"
                color="error"
                size="medium"
                sx={{ my: 2, px: 4, mr: 1 }}
                type="button"
                startIcon={<Delete />}
                onClick={() => del.current && del.current.click()}
              >
                Hapus
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
                    nama_fakultas: "",
                    status_fakultas: 1,
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
      await submitEvent(data.type, values);
    },
  });

  const createNew = async (value) => {
    const cn = await Post("/fakultas/insert", value);

    if (cn) {
      toast.show("Berhasil", "Input Data Berhasil", "SUCCESS");
    } else {
      toast.show("Gagal", "Input Data Gagal", "ERROR");
    }
  };

  const updateData = async (value) => {
    const cn = await Post("/fakultas/update", { id: data.id, ...value });

    if (cn) {
      toast.show("Berhasil", "Update Data Berhasil", "SUCCESS");
    } else {
      toast.show("Gagal", "Update Data Gagal", "ERROR");
    }
  };

  const deleteData = async () => {
    const cn = await Post("/fakultas/delete", {
      id: data.id,
    });

    if (cn) {
      toast.show("Berhasil", "Hapus Data Berhasil", "SUCCESS");
    } else {
      toast.show("Gagal", "Hapus Data Gagal", "ERROR");
    }
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
