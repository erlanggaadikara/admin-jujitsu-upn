import { observer, useLocalObservable } from "mobx-react-lite";
import { action, runInAction } from "mobx";
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
import { toast } from "component/Show/Toast";
import { LoadingButton } from "@material-ui/lab";
import {
  Save,
  ArrowBack,
  Add,
  Delete,
  AccessTimeSharp,
} from "@material-ui/icons";

const KEY = "/Organisasi/Kepengurusan";

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
      const kepengurusan = await Get("/kepengurusan");
      const member = await Get("/member");
      const jabatan = await Get("/jabatan");
      if (kepengurusan && member && jabatan) {
        let columns = [
          {
            field: "member_id",
            headerName: "Nama",
            minWidth: 300,
            valueGetter: (params) => {
              const checkMember = member.find((x) => x.id == params.value);
              return checkMember.member_nama;
            },
          },
          {
            field: "jabatan_id",
            headerName: "Jabatan",
            minWidth: 150,
            valueGetter: (params) => {
              const checkJabatan = jabatan.find((x) => x.id == params.value);
              return checkJabatan.jabatan_nama;
            },
          },
          {
            field: "kepengurusan_tahun",
            headerName: "Tahun",
            minWidth: 150,
          },
        ];

        setColumns([...columns]);
        setRows([...kepengurusan]);

        runInAction(() => {
          meta.load = false;
        });
      }
    };

    runInAction(() => {
      meta.quickAccess = window.global.checkQuickAccess(KEY);
    });

    const interval = setInterval(fetch, 3000);
    return () => clearInterval(interval);
  }, []);

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
          Kepengurusan
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
                global.saving = true;
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
    member: [],
    jabatan: [],
  }));
  const validationSchema = yup.object({
    member_id: yup.number().required("Mohon diisi"),
    jabatan_id: yup.number().required("Mohon diisi"),
    kepengurusan_tahun: yup.number().required("Mohon diisi"),
  });

  const formik = useFormik({
    initialValues: {
      member_id: data.member_id || "",
      jabatan_id: data.jabatan_id || "",
      kepengurusan_tahun: data.kepengurusan_tahun || "",
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      await submitEvent(data.type, values);
    },
  });

  const createNew = async (value) => {
    const cn = await Post("/kepengurusan/insert", {
      ...value,
      tahun_kepengurusan: value.kepengurusan_tahun,
    });

    if (cn) {
      toast.show("Berhasil", "Input Data Berhasil", "SUCCESS");
    } else {
      toast.show("Gagal", "Input Data Gagal", "ERROR");
    }
  };

  const updateData = async (value) => {
    const cn = await Post("/kepengurusan/update", {
      ...value,
      id: data.id,
      tahun_kepengurusan: value.kepengurusan_tahun,
    });

    if (cn) {
      toast.show("Berhasil", "Update Data Berhasil", "SUCCESS");
    } else {
      toast.show("Gagal", "Update Data Gagal", "ERROR");
    }
  };

  const deleteData = async () => {
    const cn = await Post("/kepengurusan/delete", {
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
    global.saving = false;
  };

  useEffect(() => {
    const fetch = async () => {
      const member = await Get("/member");
      const jabatan = await Get("/jabatan");
      if (member && jabatan) {
        runInAction(() => {
          meta.member = member;
          meta.jabatan = jabatan;
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
      <FormControl
        fullWidth
        sx={{ my: 1, mr: 1, width: { laptop: "45%", mobile: "90%" } }}
        error={formik.touched.member_id && Boolean(formik.errors.member_id)}
      >
        <InputLabel id="demo-simple-select-helper-label">
          Nama Member *
        </InputLabel>
        <Select
          labelId="demo-simple-select-helper-label"
          label="Status *"
          name="member_id"
          value={formik.values.member_id}
          onChange={formik.handleChange}
          color="primary"
        >
          {meta.member.map((item) => (
            <MenuItem key={item.id} value={item.id}>
              {item.member_nama}
            </MenuItem>
          ))}
        </Select>
        <FormHelperText>
          {formik.touched.member_id && formik.errors.member_id}
        </FormHelperText>
      </FormControl>
      <FormControl
        fullWidth
        sx={{ my: 1, mr: 1, width: { laptop: "45%", mobile: "90%" } }}
        error={formik.touched.jabatan_id && Boolean(formik.errors.jabatan_id)}
      >
        <InputLabel id="demo-simple-select-helper-label">Jabatan*</InputLabel>
        <Select
          labelId="demo-simple-select-helper-label"
          label="Status *"
          name="jabatan_id"
          value={formik.values.jabatan_id}
          onChange={formik.handleChange}
          color="primary"
        >
          {meta.jabatan.map((item) => (
            <MenuItem key={item.id} value={item.id}>
              {item.jabatan_nama}
            </MenuItem>
          ))}
        </Select>
        <FormHelperText>
          {formik.touched.jabatan_id && formik.errors.jabatan_id}
        </FormHelperText>
      </FormControl>
      <TextField
        label="Tahun *"
        name="kepengurusan_tahun"
        variant="outlined"
        color="primary"
        fullWidth
        value={formik.values.kepengurusan_tahun}
        onChange={formik.handleChange}
        error={
          formik.touched.kepengurusan_tahun &&
          Boolean(formik.errors.kepengurusan_tahun)
        }
        helperText={
          formik.touched.kepengurusan_tahun && formik.errors.kepengurusan_tahun
        }
        sx={{ my: 1, mr: 1, width: { laptop: "45%", mobile: "90%" } }}
      />
      <Button sx={{ display: "none" }} type="submit" ref={formRef.form} />
      <Button sx={{ display: "none" }} ref={formRef.del} onClick={deleteData} />
    </Box>
  );
});
