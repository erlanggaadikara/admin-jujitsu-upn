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
            valueGetter: (params) =>
              params.value == 0 ? "Belum Alumni" : "Alumni",
          },
          {
            field: "member_status_pelatih",
            headerName: "Status Pelatih",
            minWidth: 300,
            valueGetter: (params) => (params.value == 0 ? "" : "Pelatih"),
          },
          {
            field: "member_status",
            headerName: "Status",
            minWidth: 300,
            valueGetter: (params) =>
              params.value == 0 ? "Tidak Aktif" : "Aktif",
          },
        ];

        setColumns([...columns]);
        setRows([...member]);

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
            {/* <Button
              variant="contained"
              color="success"
              size="medium"
              sx={{ my: 2, px: 4, mr: 1 }}
              onClick={action(
                () =>
                  (meta.value = {
                    type: "new",
                    member_nama: "",
                    mem
                    member_status: 0,
                  })
              )}
            >
              Baru
            </Button> */}
          </Box>
        )}
      </Box>
      {!meta.value ? (
        <DataGrid
          rows={rows}
          columns={columns}
          //   onCellClick={action(
          //     (params) => (meta.value = { type: "update", ...params.row })
          //   )}
        />
      ) : (
        // <FormField data={meta.value} formRef={form} />
        <></>
      )}
    </Box>
  );
});

const FormField = observer(({ data, formRef }) => {
  const meta = useLocalObservable(() => ({
    fakultas: [],
  }));
  const validationSchema = yup.object({
    member_nama: yup.string().required("Mohon diisi"),
    fakultas_id: yup.number().required("Mohon diisi"),
    member_status: yup.number().required("Mohon diisi"),
  });

  const formik = useFormik({
    initialValues: {
      member_nama: data.member_nama,
      fakultas_id: data.fakultas_id,
      member_status: data.member_status,
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
        label="Nama member *"
        name="member_nama"
        variant="outlined"
        color="primary"
        fullWidth
        value={formik.values.member_nama}
        onChange={formik.handleChange}
        error={formik.touched.member_nama && Boolean(formik.errors.member_nama)}
        helperText={formik.touched.member_nama && formik.errors.member_nama}
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
          formik.touched.member_status && Boolean(formik.errors.member_status)
        }
      >
        <InputLabel id="demo-simple-select-helper-label">Status *</InputLabel>
        <Select
          labelId="demo-simple-select-helper-label"
          label="Status *"
          name="member_status"
          value={formik.values.member_status}
          onChange={formik.handleChange}
          color="primary"
        >
          <MenuItem value={0}>Non Aktif</MenuItem>
          <MenuItem value={1}>Aktif</MenuItem>
        </Select>
        <FormHelperText>
          {formik.touched.member_status && formik.errors.member_status}
        </FormHelperText>
      </FormControl>
      <Button sx={{ display: "none" }} type="submit" ref={formRef} />
    </Box>
  );
});
