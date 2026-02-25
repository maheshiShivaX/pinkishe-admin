import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { saveReport, updateSavedReport, viewSavedReport } from "../store/reportsSlice";


const useSavedReport = ({ initialValues, reportType, summary }) => {
    const { id: reportId } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const token = localStorage.getItem("authToken");

    const { selectedSavedReport, viewSavedReportLoading, saveReportLoading } =
        useSelector((state) => state.reports);

    const [openSave, setOpenSave] = useState(false);
    const [reportName, setReportName] = useState("");

    /* VIEW SAVED REPORT */
    useEffect(() => {
        if (token && reportId) {
            dispatch(viewSavedReport({ token, id: reportId }));
        }
    }, [token, reportId, dispatch]);

    /* SET REPORT NAME */
    useEffect(() => {
        if (selectedSavedReport?.reportName) {
            setReportName(selectedSavedReport.reportName);
        }
    }, [selectedSavedReport]);

    /* MERGE FILTERS */
    const parsedFilters = useMemo(() => {
        if (!selectedSavedReport?.filters) return initialValues;
        return { ...initialValues, ...selectedSavedReport.filters };
    }, [selectedSavedReport, initialValues]);

    /* SAVE / UPDATE */
    const handleSaveOrUpdate = async (values) => {
        if (!reportName) return;

        const payload = {
            token,
            reportName,
            filters: values,
        };

        try {
            if (reportId) {
                await dispatch(
                    updateSavedReport({ ...payload, id: reportId })
                ).unwrap();
            } else {
                await dispatch(
                    saveReport({
                        ...payload,
                        reportType,
                        summary,
                    })
                ).unwrap();
            }

            setOpenSave(false);
            navigate("/saved-reports");
        } catch (err) {
            console.error("Save/Update failed", err);
        }
    };

    return {
        reportId,
        openSave,
        setOpenSave,
        reportName,
        setReportName,
        parsedFilters,
        handleSaveOrUpdate,
        viewSavedReportLoading,
        saveReportLoading,
    };
};

export default useSavedReport;
