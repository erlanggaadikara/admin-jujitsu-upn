import { observer, useLocalObservable } from "mobx-react-lite";
import { action, runInAction, toJS } from "mobx";
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  useMediaQuery,
  Tooltip,
  MenuItem,
  FormControl,
  Select,
  InputLabel,
  FormHelperText,
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
import ReactQuill from "react-quill";
import UploadImage from "component/UploadImage";
import { toBase64, base64Image } from "utils/formatFile";
import "react-quill/dist/quill.snow.css";

const KEY = "/Blog";

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

  const WEB_URL = "https://honeybadger-fighter.com/Blog/";

  useEffect(() => {
    const fetch = async () => {
      const blog = await Get("/blog");
      if (blog) {
        let columns = [
          {
            field: "blog_title",
            headerName: "Judul",
            minWidth: 300,
          },
          {
            field: "blog_author",
            headerName: "Author",
            minWidth: 300,
          },
          {
            field: "blog_slug",
            headerName: "Slug",
            minWidth: 300,
          },
          {
            field: "site",
            headerName: "Site",
            minWidth: 200,
            renderCell: (params) => {
              const slug = params.getValue(params.id, "blog_slug");
              const url = WEB_URL + slug;
              return (
                <strong>
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    style={{ marginLeft: 16 }}
                    onClick={() => window.open(url, "_blank")}
                  >
                    Preview
                  </Button>
                </strong>
              );
            },
          },
        ];

        setColumns([...columns]);
        setRows([...blog]);

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
          Blog
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
          onCellClick={action((params, event) => {
            event.defaultMuiPrevented = true;
            meta.value = { type: "update", ...params.row };
          })}
        />
      ) : (
        <FormField data={meta.value} formRef={{ form, del }} />
      )}
    </Box>
  );
});

const FormField = observer(({ data, formRef }) => {
  const meta = useLocalObservable(() => ({
    slug: data.blog_slug || "",
    image: data.blog_image || "",
  }));
  const validationSchema = yup.object({
    title: yup.string().required("Mohon diisi"),
  });

  const [content, setContent] = useState(data.blog_content || "");
  const toolbar = {
    modules: {
      toolbar: [
        [{ header: [1, 2, false] }],
        ["bold", "italic", "underline", "strike", "blockquote"],
        [
          { list: "ordered" },
          { list: "bullet" },
          { indent: "-1" },
          { indent: "+1" },
        ],
        ["link", "image"],
        ["clean"],
      ],
    },
    formats: [
      "header",
      "bold",
      "italic",
      "underline",
      "strike",
      "blockquote",
      "list",
      "bullet",
      "indent",
      "link",
      "image",
    ],
  };

  const formik = useFormik({
    initialValues: {
      author: data.blog_author || window.session.username,
      title: data.blog_title || "",
      type: data.blog_type || "Blog",
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      global.saving = true;
      let img = meta.image.base64 ? meta.image.base64 : "";
      await submitEvent(data.type, {
        slug: meta.slug,
        image: img,
        content,
        ...values,
      });
    },
  });

  const createNew = async (value) => {
    const cn = await Post("/blog/insert", value);

    if (cn) {
      window.toast.show("Berhasil", "Input Data Berhasil", "SUCCESS");
    } else {
      window.toast.show("Gagal", "Input Data Gagal", "ERROR");
    }
  };

  const updateData = async (value) => {
    const cn = await Post("/blog/update", { id: data.id, ...value });

    if (cn) {
      window.toast.show("Berhasil", "Update Data Berhasil", "SUCCESS");
    } else {
      window.toast.show("Gagal", "Update Data Gagal", "ERROR");
    }
  };

  const deleteData = async () => {
    global.removing = true;
    const cn = await Post("/blog/delete", {
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

  const setFileToUpload = action((e) => {
    const file = e.target.files[0];
    if (file) {
      const type = file.type != "" ? file.type : null;
      const fmtFile = type.split("/");
      if (["png", "jpg", "jpeg"].includes(fmtFile[1])) {
        toBase64(file).then(
          action((result) => {
            let respon = result.split(",");
            meta.image = {
              file: respon && respon[1] ? base64Image(type, respon[1]) : "",
              base64: respon[1],
            };
          })
        );
      } else {
        window.toast.show("Gagal", "Format file tidak didukung", "ERROR");
      }
    }
  });

  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: "row",
        flexWrap: "wrap",
        pb: { mobile: 10 },
      }}
      component="form"
      onSubmit={formik.handleSubmit}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          my: 1,
          mr: 1,
          width: { laptop: "45%", mobile: "90%" },
        }}
      >
        <TextField
          label="Judul *"
          name="title"
          variant="outlined"
          color="primary"
          fullWidth
          value={formik.values.title}
          onChange={action((e) => {
            const val = e.target.value;
            formik.setFieldValue("title", val);
            meta.slug = val.toLowerCase().replace(/ /g, "-");
          })}
          error={formik.touched.title && Boolean(formik.errors.title)}
          helperText={formik.touched.title && formik.errors.title}
        />
        <Typography variant="caption" sx={{ ml: 1, my: 1 }}>
          slug: {meta.slug}
        </Typography>
        <TextField
          label="Author"
          name="author"
          variant="outlined"
          color="primary"
          fullWidth
          disabled
          value={formik.values.author}
          sx={{ my: 1 }}
        />
        <FormControl
          fullWidth
          sx={{ my: 1 }}
          error={formik.touched.type && Boolean(formik.errors.type)}
        >
          <InputLabel id="demo-simple-select-helper-label">Tipe *</InputLabel>
          <Select
            labelId="demo-simple-select-helper-label"
            label="Tipe *"
            name="type"
            value={formik.values.type}
            onChange={formik.handleChange}
            color="primary"
          >
            <MenuItem value={"Blog"}>Blog</MenuItem>
            <MenuItem value={"News"}>News</MenuItem>
          </Select>
          <FormHelperText>
            {formik.touched.type && formik.errors.type}
          </FormHelperText>
        </FormControl>
      </Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          mb: 2,
          mx: 10,
        }}
      >
        <Typography variant="h6">Foto Banner</Typography>
        <UploadImage src={meta.image} onChange={setFileToUpload} />
      </Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          minHeight: "40vh",
          maxWidth: "80vw",
          width: "100%",
          my: 2,
        }}
      >
        <Typography variant="h6">Content</Typography>
        <ReactQuill
          theme="snow"
          value={content}
          onChange={setContent}
          modules={toolbar.modules}
          formats={toolbar.formats}
          style={{ height: "100%", width: "100%" }}
        />
      </Box>
      <Button sx={{ display: "none" }} type="submit" ref={formRef.form} />
      <Button sx={{ display: "none" }} ref={formRef.del} onClick={deleteData} />
    </Box>
  );
});
