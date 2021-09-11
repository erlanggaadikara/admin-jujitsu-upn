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
} from "@material-ui/core";
import { DataGrid } from "@mui/x-data-grid";
import { Get, Post } from "utils/api";
import { useEffect, useState, useRef } from "react";
import { useFormik } from "formik";
import * as yup from "yup";
import { toast } from "component/Show/Toast";
import { LoadingButton, MobileDatePicker } from "@material-ui/lab";
import { Save, ArrowBack, Add, Delete } from "@material-ui/icons";
import { setLocalDate } from "utils/format";

export default observer(() => {
  const isMobile = useMediaQuery("(max-width:640px)");
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
      const member = await Get("/member");
      const jurusan = await Get("/jurusan");
      if (member) {
        let columns = [
          {
            field: "member_nama",
            headerName: "Nama",
            minWidth: 300,
          },
          {
            field: "member_npm",
            headerName: "NPM",
            minWidth: 300,
          },
          {
            field: "jurusan_id",
            headerName: "Jurusan",
            minWidth: 300,
            valueGetter: (params) => {
              const checkJurusan = jurusan.find((x) => x.id == params.value);
              return checkJurusan.jurusan_nama;
            },
          },
          {
            field: "member_email",
            headerName: "Email",
            minWidth: 300,
          },
          {
            field: "member_alamat",
            headerName: "Alamat",
            minWidth: 300,
          },
          {
            field: "member_tempatlahir",
            headerName: "Tempat Lahir",
            minWidth: 300,
          },
          {
            field: "member_tanggallahir",
            headerName: "Tanggal Lahir",
            minWidth: 300,
          },
          {
            field: "member_nohp",
            headerName: "Tanggal Lahir",
            minWidth: 300,
          },
          {
            field: "member_otw_nama",
            headerName: "Nama Orang Tua/Wali",
            minWidth: 300,
          },
          {
            field: "member_otw_nohp",
            headerName: "No Hp Orang Tua/Wali",
            minWidth: 300,
          },
          {
            field: "member_status_alumni",
            headerName: "Status Alumni",
            minWidth: 300,
            valueGetter: (params) => (params.value == 0 ? "" : "Alumni"),
          },
          {
            field: "member_status_pelatih",
            headerName: "Status Pelatih",
            minWidth: 300,
            valueGetter: (params) => (params.value == 0 ? "" : "Pelatih"),
          },
        ];

        setColumns([...columns]);
        setRows([...member]);

        runInAction(() => {
          meta.load = false;
        });
      }
    };

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
        {meta.value && (
          <IconButton
            aria-label="back"
            onClick={action(() => (meta.value = ""))}
          >
            <ArrowBack />
          </IconButton>
        )}
        <Typography variant="h5" sx={{ my: 2 }}>
          Member
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
                onClick={() => {
                  del.current && del.current.click();
                  meta.value = "";
                }}
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
    jurusan: [],
  }));
  const validationSchema = yup.object({
    email: yup.string().email().required("Mohon diisi"),
    nama: yup.string().required("Mohon diisi"),
    npm: yup.number().required("Mohon diisi"),
    tempatlahir: yup.string().required("Mohon diisi"),
    tanggallahir: yup.string().required("Mohon diisi"),
    alamat: yup.string().required("Mohon diisi"),
    nohp: yup.string().required("Mohon diisi"),
    jurusan_id: yup.number().required("Mohon diisi"),
  });

  const formik = useFormik({
    initialValues: {
      email: data.member_email || "",
      nama: data.member_nama || "",
      npm: data.member_npm || "",
      tempatlahir: data.member_tempatlahir || "",
      tanggallahir: data.member_tanggallahir
        ? new Date(data.member_tanggallahir)
        : new Date(),
      alamat: data.member_alamat || "",
      nohp: data.member_nohp || "",
      jurusan_id: data.jurusan_id || 0,
      otw_nama: data.member_otw_nama || "",
      otw_nohp: data.member_otw_nohp || "",
      status_alumni: data.member_status_alumni || 0,
      status_pelatih: data.member_status_pelatih || 0,
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      console.log({
        ...values,
        tanggallahir: setLocalDate(values.tanggallahir),
      });
      await submitEvent(data.type, {
        ...values,
        tanggallahir: setLocalDate(values.tanggallahir),
      });
    },
  });

  const createNew = async (value) => {
    const cn = await Post("/register_member", {
      password: value.npm,
      ...value,
    });

    if (cn) {
      toast.show("Berhasil", "Input Data Berhasil", "SUCCESS");
    } else {
      toast.show("Gagal", "Input Data Gagal", "ERROR");
    }
  };

  const updateData = async (value) => {
    const cn = await Post("/member/update", {
      id: data.id,
      ...value,
    });

    if (cn) {
      toast.show("Berhasil", "Update Data Berhasil", "SUCCESS");
    } else {
      toast.show("Gagal", "Update Data Gagal", "ERROR");
    }
  };

  const deleteData = async () => {
    const cn = await Post("/member/delete", {
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
      const jurusan = await Get("/jurusan");
      if (jurusan) {
        runInAction(() => {
          meta.jurusan = jurusan;
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
        label="Nama member *"
        name="nama"
        variant="outlined"
        color="primary"
        fullWidth
        value={formik.values.nama}
        onChange={formik.handleChange}
        error={formik.touched.nama && Boolean(formik.errors.nama)}
        helperText={formik.touched.nama && formik.errors.nama}
        sx={{ my: 1, mr: 1, width: { laptop: "45%", mobile: "90%" } }}
      />
      <TextField
        label="Email *"
        name="email"
        variant="outlined"
        color="primary"
        fullWidth
        value={formik.values.email}
        onChange={formik.handleChange}
        error={formik.touched.email && Boolean(formik.errors.email)}
        helperText={formik.touched.email && formik.errors.email}
        sx={{ my: 1, mr: 1, width: { laptop: "45%", mobile: "90%" } }}
      />
      <TextField
        label="NPM *"
        name="npm"
        variant="outlined"
        color="primary"
        fullWidth
        value={formik.values.npm}
        onChange={formik.handleChange}
        error={formik.touched.npm && Boolean(formik.errors.npm)}
        helperText={formik.touched.npm && formik.errors.npm}
        sx={{ my: 1, mr: 1, width: { laptop: "45%", mobile: "90%" } }}
      />
      <TextField
        label="Tempat Lahir *"
        name="tempatlahir"
        variant="outlined"
        color="primary"
        fullWidth
        value={formik.values.tempatlahir}
        onChange={formik.handleChange}
        error={formik.touched.tempatlahir && Boolean(formik.errors.tempatlahir)}
        helperText={formik.touched.tempatlahir && formik.errors.tempatlahir}
        sx={{ my: 1, mr: 1, width: { laptop: "45%", mobile: "90%" } }}
      />
      <MobileDatePicker
        label="Tanggal Lahir *"
        inputFormat="MM/dd/yyyy"
        value={formik.values.tanggallahir}
        onChange={(value) => {
          formik.setFieldValue("tanggallahir", value);
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            fullWidth
            sx={{ my: 1, mr: 1, width: { laptop: "45%", mobile: "90%" } }}
            color="primary"
          />
        )}
      />
      <TextField
        label="Alamat *"
        name="alamat"
        variant="outlined"
        color="primary"
        fullWidth
        value={formik.values.alamat}
        onChange={formik.handleChange}
        error={formik.touched.alamat && Boolean(formik.errors.alamat)}
        helperText={formik.touched.alamat && formik.errors.alamat}
        sx={{ my: 1, mr: 1, width: { laptop: "45%", mobile: "90%" } }}
      />
      <TextField
        label="No HP/Whatsapp *"
        name="nohp"
        variant="outlined"
        color="primary"
        fullWidth
        value={formik.values.nohp}
        onChange={formik.handleChange}
        error={formik.touched.nohp && Boolean(formik.errors.nohp)}
        helperText={formik.touched.nohp && formik.errors.nohp}
        sx={{ my: 1, mr: 1, width: { laptop: "45%", mobile: "90%" } }}
      />
      <FormControl
        fullWidth
        sx={{ my: 1, mr: 1, width: { laptop: "45%", mobile: "90%" } }}
        error={formik.touched.jurusan_id && Boolean(formik.errors.jurusan_id)}
      >
        <InputLabel id="demo-simple-select-helper-label">Jurusan *</InputLabel>
        <Select
          labelId="demo-simple-select-helper-label"
          label="Jurusan *"
          name="jurusan_id"
          value={formik.values.jurusan_id}
          onChange={formik.handleChange}
          color="primary"
        >
          {meta.jurusan.map((item) => (
            <MenuItem key={item.id} value={item.id}>
              {item.jurusan_nama}
            </MenuItem>
          ))}
        </Select>
        <FormHelperText>
          {formik.touched.jurusan_id && formik.errors.jurusan_id}
        </FormHelperText>
      </FormControl>
      <TextField
        label="Nama Orang Tua"
        name="otw_nama"
        variant="outlined"
        color="primary"
        fullWidth
        value={formik.values.otw_nama}
        onChange={formik.handleChange}
        sx={{ my: 1, mr: 1, width: { laptop: "45%", mobile: "90%" } }}
      />
      <TextField
        label="No Hp/Whatsapp Orang Tua"
        name="otw_hp"
        variant="outlined"
        color="primary"
        fullWidth
        value={formik.values.otw_hp}
        onChange={formik.handleChange}
        sx={{ my: 1, mr: 1, width: { laptop: "45%", mobile: "90%" } }}
      />
      <FormControl
        fullWidth
        sx={{ my: 1, mr: 1, width: { laptop: "45%", mobile: "90%" } }}
      >
        <InputLabel id="demo-simple-select-helper-label">
          Status Alumni
        </InputLabel>
        <Select
          labelId="demo-simple-select-helper-label"
          label="Status Alumni"
          name="status_alumni"
          value={formik.values.status_alumni}
          onChange={formik.handleChange}
          color="primary"
        >
          <MenuItem value={0}></MenuItem>
          <MenuItem value={1}>Alumni</MenuItem>
        </Select>
      </FormControl>
      <FormControl
        fullWidth
        sx={{ my: 1, mr: 1, width: { laptop: "45%", mobile: "90%" } }}
      >
        <InputLabel id="demo-simple-select-helper-label">
          Status Pelatih
        </InputLabel>
        <Select
          labelId="demo-simple-select-helper-label"
          label="Status Pelatih"
          name="status_pelatih"
          value={formik.values.status_pelatih}
          onChange={formik.handleChange}
          color="primary"
        >
          <MenuItem value={0}></MenuItem>
          <MenuItem value={1}>Pelatih</MenuItem>
        </Select>
      </FormControl>
      <Button sx={{ display: "none" }} type="submit" ref={formRef.form} />
      <Button sx={{ display: "none" }} ref={formRef.del} onClick={deleteData} />
    </Box>
  );
});
