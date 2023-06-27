import { Button, Layout, Row, Col, Progress, Tag, Table, Card, Modal, Input, Form, Tooltip, Checkbox, message, Upload, Select, Spin } from "antd";
import Header from "./header";
import UserImage from "../../assests/img/companyLogo.png";
import Footer from "../footer";
import DashPage from "./top";
import APIHelpers from "../api/apiHelper";
import { CheckOutlined, CloseOutlined, DeleteOutlined, DownloadOutlined, EditOutlined, ExclamationCircleOutlined, EyeOutlined, InfoCircleOutlined, LoadingOutlined, PlusOutlined, ShareAltOutlined, UploadOutlined, UserAddOutlined, UserDeleteOutlined, UserOutlined, UserSwitchOutlined } from "@ant-design/icons";
import Search from "antd/lib/input/Search";
import React, { useState, useEffect } from "react";
import { SearchFilter } from "../api/searchHelper";
import { useRouter } from "next/router";
import { ESGCalculation, IndexCalculation } from "../api/calculationHelper";
import moment from "moment";
// import { LogoSignedUrl } from "../api/signedUrlHelper";
import { MSIC, POSTCODE, REPORTURL, STATE, WEBURL, DEPARTMENT, POSITIONLEVEL, TITLE, BUSINESSENTITY, PORTFOLIOREPORTURL, SUSBSCRIPTIONPLAN } from "../../compenents/config";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";

const { Content } = Layout;
const { Column } = Table;
const { Option } = Select;

const LearningList = ["ESG", "Environment", "Social", "Governance", "Sustainable Procurement"];

function QuestionnairePage() {
  const router = useRouter();
  const [activeReportTable, setReportTable] = useState("assestment");
  const [activeLearningTable, setLearningTable] = useState("");
  const [addSmeUserModalVisible, setSmeUserModalVisible] = useState(false);
  const [editSmeUserModalVisible, setEditSmeUserModalVisible] = useState(false);
  const [company, setCompany] = useState({});
  const [profile, setProfile] = useState({});
  const [smeUsers, setSmeUsers] = useState([]);
  const [learningData, setLearningData] = useState({});
  const [learningTabList, setLearningTabList] = useState([]);
  const [assessment, setAssessment] = useState([]);
  const [completedAssessment, setCompletedAssessment] = useState([]);
  const [fullCompletedAssessment, setFullCompletedAssessment] = useState([]);
  const [continueAssessment, setContinueAssessment] = useState({});
  const [currentProgress, setCurrentProgress] = useState(0);
  const [lastAssessment, setLastAssessment] = useState("");
  const [accessLevel, setAccessLevel] = useState(-1);
  const [shareReportModalVisible, setShareReportModalVisible] = useState(false);
  const [reportID, setReportID] = useState("");
  const [reportSerialNo, setReportSerialNo] = useState("");
  const [sharedWith, setSharedWith] = useState([]);
  const [logo, setLogo] = useState(null);
  const [companyLogo, setCompanyLogo] = useState(null);
  const [uploadLogoVisible, setUploadLogoVisible] = useState(false);
  const [editCompanyProfileVisible, setEditCompanyProfileVisible] = useState(false);
  const [edit] = Form.useForm();
  const [ssmFile, setSSMFile] = useState(null);
  const [selectState, setSelectState] = useState("");
  const [addUser] = Form.useForm();
  const [editUser] = Form.useForm();
  const [editUserData, setEditUserData] = useState({});
  const [selectEntity, setSelectEntity] = useState("");
  const [selectRegistered, setSelectRegistered] = useState(null);
  const [isSSM, setIsSSM] = useState(null);
  const [isDownload, setIsDownload] = useState(false);
  const [pendingShare, setPendingShare] = useState(false);
  const [pendingConnection, setPendingConnection] = useState(false);
  const [pendingVisible, setPendingVisible] = useState(false);
  const [selectEducation, setSelectEducation] = useState("");
  const [newConnectionVisible, setNewConnectionVisible] = useState(false);
  const [reqConnection, setReqConnection] = useState([]);
  const [recConnection, setRecConnection] = useState([]);
  const [linkedCompany, setLinkCompany] = useState([]);
  const [linkedCompanyId, setLinkCompanyId] = useState([]);
  const [fullLinkedCompany, setFullLinkedCompany] = useState([]);
  const [newCompany, setNewCompany] = useState([]);
  const [filteredCompany, setFilteredCompany] = useState([]);
  const [fullCompany, setFullCompany] = useState([]);
  const [allPortfolioScore, setAllPortfolioScore] = useState([]);
  const [fullPortfolioScore, setFullPortfolioScore] = useState([]);
  const [portfolioData, setPortfolioData] = useState([]);
  const [portfolioDataReady, setPortfolioDataReady] = useState(0);
  const [sharedAssessment, setSharedAssessment] = useState([]);
  const [fullSharedAssessment, setFullSharedAssessment] = useState([]);
  const [reportTabList, setReportTabList] = useState([]);
  const [subscriptionPlan, setSubscriptionPlan] = useState("");
  const [connectedCompany, setConnectedCompany] = useState([]);
  const [connectedCompanyDetails, setConnectedCompanyDetails] = useState([]);
  const [esgLevel, setEsgLevel] = useState(-1);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (sessionStorage.getItem("role") === "VENDOR") {
      getVendorProfile();
    } else {
      getProfile();
    }
  }, []);

  useEffect(() => {
    if (Object.keys(profile).length > 0) {
      getSubscription();
      getCompany();
    }
  }, [profile]);

  useEffect(() => {
    if (Object.keys(company).length > 0) {
      getAssessment();
    
      // getLearningResource();
      edit.setFieldsValue({
        name: company.companyName,
        businessEntity: company.businessEntity,
        educationType: company.educationType,
        ssmNum: company.ssmNumber,
        smeCorpRegistrationNumber: company.ssmCorpRegistrationNumber,
        postCode: company.postCode,
        msic: company.msic,
        state: company.state,
      });
    }
  }, [company]);

  useEffect(() => {
    if (Object.keys(continueAssessment).length > 0) {
      getContinueAssessment();
    }
  }, [continueAssessment]);

  useEffect(() => {
    if (completedAssessment.length > 0) {
      // getAssessmentLevel();
    }
  }, [completedAssessment]);

  useEffect(() => {
    if (selectEntity !== "") {
      if (selectEntity !== "EDUCATIONAL_INSTITUTION") {
        setSelectEducation("");
      }
      if (selectEntity === "GOVERNMENT") {
        edit.setFieldsValue({
          registered: null,
          educationType: null,
          ssmNum: "",
          msic: null,
        });
      }
    }
  }, [selectEntity]);

  useEffect(() => {
    if ((pendingShare === true || pendingConnection === true) && router.query.login) {
      setPendingVisible(true);
    }
  }, [pendingShare, pendingConnection]);

  useEffect(() => {
    if (reqConnection !== null || recConnection !== null) {
      let all = [];
      if (reqConnection !== null && recConnection === null) {
        all = reqConnection;
      } else if (reqConnection === null && recConnection !== null) {
        all = recConnection;
      } else {
        all = [].concat(reqConnection, recConnection);
      }
      let connection = [];
      let linked = [];
      let connected = [];
      let connectedDetails = [];
      all.map((val, index) => {
        let com = [];
        let role = "";
        if (val.requestCompanyID !== company.id) {
          com = fullCompany.filter((item) => item.id === val.requestCompanyID)[0];
          role = "receiver";
        } else {
          com = fullCompany.filter((item) => item.id === val.receivedCompanyID)[0];
          role = "requestor";
        }
        let date = new Date(val.linkDate);
        date = ("0" + date.getDate()).slice(-2) + "/" + ("0" + (date.getMonth() + 1)).slice(-2) + "/" + date.getFullYear();
        connection.push({
          id: com.id,
          connectionId: val.id,
          companyName: com.companyName,
          ssmNumber: com.ssmNumber,
          industry: com.industry,
          linkDate: date,
          role: role,
          status: val.status === "INVITED" ? "Pending" : val.status === "ACTIVE" ? "Connected" : "Disconnected",
        });
        if (val.status !== "INACTIVE") {
          linked.push(com.id);
          if (val.status === "ACTIVE") {
            connected.push(com.id);
            connectedDetails.push({
              companyId: com.id,
              date: val.linkDate,
            });
          }
        }
        if (index === all.length - 1) {
          setLinkCompanyId(linked);
          setConnectedCompany(connected);
          setConnectedCompanyDetails(connectedDetails);
          setLinkCompany(connection.filter((item) => item.status !== "Disconnected"));
          setFullLinkedCompany(connection.filter((item) => item.status !== "Disconnected"));
          setFilteredCompany([]);
          setNewCompany(fullCompany.filter((item) => item.id !== company.id && !linked.includes(item.id)));
        }
      });
    } else {
      setFilteredCompany([]);
      setNewCompany(fullCompany.filter((item) => item.id !== company.id));
    }
  }, [reqConnection, recConnection]);

  useEffect(() => {
    if (Object.keys(company).length > 0 && fullCompany.length > 0) {
      getReqConnections();
      getRecConnections();
    }
  }, [company, fullCompany]);

  useEffect(() => {
    if (portfolioData.length > 0 && portfolioDataReady === 1) {
      let currentYear = new Date().getFullYear();
      let currentMonth = new Date().getMonth() + 1;
      let currentQuarter = Math.ceil(currentMonth / 3);
      let data = portfolioData;
      let linked = [];
      data.map((val) => {
        if (val.sharedWiths !== null) {
          val.sharedWiths.map((share) => {
            if (share.corporateID === company.id && share.status === "ACTIVE") {
              linked.push(val);
            }
          });
        }
      });
      linked = linked.sort((a, b) => new Date(b.completionDate) - new Date(a.completionDate));
      let year = new Object();
      let smeId = [];
      linked.map((val) => {
        let reportYear = new Date(val.completionDate).getFullYear();
        let reportMonth = new Date(val.completionDate).getMonth() + 1;
        reportMonth = Math.ceil(reportMonth / 3);

        if (!(reportYear + "Q" + reportMonth in year)) {
          year[reportYear + "Q" + reportMonth] = [];
        }
        if (!smeId.includes(val.smeID)) {
          year[reportYear + "Q" + reportMonth].push(val);
          smeId.push(val.smeID);
        }
      });

      let portfolio = [];
      let totalEnv = 0;
      let totalSoc = 0;
      let totalGov = 0;
      let totalSus = 0;
      let totalScore = 0;
      Object.keys(year).map((val, index) => {
        let env = 0;
        let soc = 0;
        let gov = 0;
        let sus = 0;
        let score = 0;
        year[val].map((val1, index1) => {
          let yearValue = val.slice(0, 4);
          let quarter = val.slice(-1);
          if (quarter === "1") {
            quarter = "31 Mac";
          } else if (quarter === "2") {
            quarter = "30 Jun";
          } else if (quarter === "3") {
            quarter = "30 Sep";
          } else if (quarter === "4") {
            quarter = "31 Dec";
          }
          APIHelpers.GET("v1/assessmentEntries?assessmentId=" + val1.id)
            .then((res) => {
              ESGCalculation(res.items)
                .then((res) => {
                  env += res["Environmental"];
                  soc += res["Social"];
                  gov += res["Governance"];
                  sus += res["Sustainable Procurement"];
                  // sus += 50;
                  score += res.overall;
                  totalEnv += res["Environmental"];
                  totalSoc += res["Social"];
                  totalGov += res["Governance"];
                  totalSus += res["Sustainable Procurement"];
                  // totalSus += 50;
                  totalScore += res.overall;
                  if (index1 === year[val].length - 1) {
                    setTimeout(() => {
                      if ((currentYear === parseInt(yearValue) && currentQuarter > parseInt(quarter)) || currentYear > parseInt(yearValue)) {
                        portfolio.push({
                          name: "Portfolio Report as of " + quarter + " " + yearValue,
                          Env: Math.round(env / year[val].length),
                          Soc: Math.round(soc / year[val].length),
                          Gov: Math.round(gov / year[val].length),
                          Sus: Math.round(sus / year[val].length),
                          score: Math.round(score / year[val].length),
                          year: yearValue,
                          quarter: val.slice(-1),
                        });
                      }
                      if (index === Object.keys(year).length - 1) {
                        portfolio.unshift({
                          name: "Portfolio Report as of Today",
                          Env: Math.round(totalEnv / linked.length),
                          Soc: Math.round(totalSoc / linked.length),
                          Gov: Math.round(totalGov / linked.length),
                          Sus: Math.round(totalSus / linked.length),
                          score: Math.round(totalScore / linked.length),
                          year: yearValue,
                          quarter: val.slice(-1),
                        });
                        setEsgLevel(Math.round(totalScore / linked.length));
                        setAllPortfolioScore(portfolio);
                        setFullPortfolioScore(portfolio);
                      }
                    }, 500);
                  }
                })
                .catch(() => {});
            })
            .catch(() => {});
        });
      });
    }
  }, [portfolioData, portfolioDataReady]);

  useEffect(() => {
    if (connectedCompany.length > 0 && Object.keys(company).length > 0) {
      getAllAssessment();
    }
  }, [connectedCompany, company]);

  const getSubscription = () => {
    APIHelpers.GET("v1/subscriptions?corporateId=" + profile.companyID).then((res) => {
      if (res.items) {
        setSubscriptionPlan(res.items.at(-1).subscriptionPlan);
        if (res.items.at(-1).subscriptionPlan !== "Single Business Plan") {
          setReportTabList([
            {
              key: "assestment",
              tab: "My Assessment Report",
            },
            {
              key: "singleBusiness",
              tab: "Shared Assessment Report",
            },
            {
              key: "portfolio",
              tab: "Portfolio Report",
            },
            {
              key: "connection",
              tab: "My Connection",
            },
          ]);
        } else {
          setReportTabList([
            {
              key: "assestment",
              tab: "My Assessment Report",
            },
            {
              key: "connection",
              tab: "My Connection",
            },
          ]);
        }
      }
    });
  };

 
  const getCompany = () => {
    APIHelpers.GET("v1/smes?id=" + profile.companyID)
      .then((res) => {
        setSelectEntity(res.items[0].businessEntity);
        setSelectRegistered(res.items[0].registeredInEastMY);
        setSelectState(res.items[0].state.replace(/\s/g, ""));
        setSelectEntity(res.items[0].businessEntity);
        setSelectEducation(res.items[0].educationTypea);
        // if (res.items[0].profilePicture !== "") {
        //   LogoSignedUrl(res.items[0].profilePicture)
        //     .then((res) => {
        //       setCompanyLogo(res);
        //     })
        //     .catch(() => {});
        // }
        setCompanyLogo(WEBURL + "/storage/" + res.items[0].profilePicture);
        setCompany(res.items[0]);
      })
      .catch(() => {});
  };

  const getAssessment = () => {
    APIHelpers.GET("v1/assessments?smeId=" + company.id)
      .then((res) => {
        if (res.items !== null) {
          if (res.items.filter((item) => item.completionDate === "0001-01-01T00:00:00Z").length > 0) {
            setContinueAssessment(res.items.filter((item) => item.completionDate === "0001-01-01T00:00:00Z")[0]);
          }
          res.items = res.items.filter((item) => item.completionDate !== "0001-01-01T00:00:00Z");
          res.items = res.items.sort((a, b) => new Date(b.completionDate) - new Date(a.completionDate));
          res.items.map((val) => {
            val.shared = [];
            if (val.sharedWiths !== null) {
              val.sharedWiths.map((val1) => {
                if (val1.status === "INVITED") {
                  setPendingShare(true);
                } else if (val1.status === "ACTIVE") {
                  val.shared.push(val1.corporateID);
                }
              });
            }
            let date = new Date(val.completionDate);
            val.oriDate = date;
            val.formatCompletionDate = ("0" + date.getDate()).slice(-2) + "/" + ("0" + (date.getMonth() + 1)).slice(-2) + "/" + date.getFullYear();
            let validStart = ("0" + date.getDate()).slice(-2) + "/" + ("0" + (date.getMonth() + 1)).slice(-2) + "/" + date.getFullYear();
            let validEnd = date;
            validEnd.setDate(validEnd.getDate() - 1);
            validEnd.setFullYear(validEnd.getFullYear() + 1);
            validEnd = ("0" + validEnd.getDate()).slice(-2) + "/" + ("0" + (validEnd.getMonth() + 1)).slice(-2) + "/" + validEnd.getFullYear();
            val.validityDate = validStart + " - " + validEnd;
          });
          if (res.items.filter((item) => item.formatCompletionDate !== "01 Jan 1").length > 0) {
            let last = res.items.filter((item) => item.formatCompletionDate !== "01 Jan 1")[0];
            let lastDate = new Date(last.completionDate);
            let current = new Date();
            let months = Math.floor((current - lastDate) / (1000 * 60 * 60 * 24 * 30));
            if (months < 6) {
              lastDate = new Date(lastDate.setMonth(lastDate.getMonth() + 6));
              lastDate = ("0" + lastDate.getDate()).slice(-2) + "/" + ("0" + (lastDate.getMonth() + 1)).slice(-2) + "/" + lastDate.getFullYear();
              setCurrentProgress(100);
              setLastAssessment(lastDate);
            }
          }
          let completed = res.items.filter((item) => item.formatCompletionDate !== "01 Jan 1");
          completed.map((val, index) => {
            APIHelpers.GET("v1/assessmentEntries?assessmentId=" + val.id)
              .then((res) => {
                IndexCalculation(res.items)
                  .then((res) => {
                    val.score = res;
                    if (index === completed.length - 1) {
                      setTimeout(() => {
                        completed = completed.sort((a, b) => moment(a.oriDate).unix() - moment(b.oriDate).unix());
                        setCompletedAssessment(completed);
                        setFullCompletedAssessment(completed);
                      }, 1000);
                    }
                  })
                  .catch(() => {});
              })
              .catch(() => {});
          });
          setAssessment(res.items);
        }
      })
      .catch(() => {});
  };

  // const getAllAssessment = () => {
  //   APIHelpers.GET("v1/assessments")
  //     .then((res) => {
  //       let complete = res.items.filter((item) => connectedCompany.includes(item.smeID) && item.completionDate !== "0001-01-01T00:00:00Z");
  //       if (complete.length > 0) {
  //         setPortfolioDataReady(portfolioDataReady + 1);
  //         setPortfolioData(complete);
  //       }
  //       complete = complete.sort((a, b) => new Date(b.completionDate) - new Date(a.completionDate));
  //       complete.map((val, index) => {
  //         APIHelpers.GET("v1/assessmentEntries?assessmentId=" + val.id)
  //           .then((res) => {
  //             ESGCalculation(res.items)
  //               .then((res) => {
  //                 let date = new Date(val.completionDate);
  //                 val.oriDate = date;
  //                 val.formatCompletionDate = ("0" + date.getDate()).slice(-2) + "/" + ("0" + (date.getMonth() + 1)).slice(-2) + "/" + date.getFullYear();
  //                 let validStart = ("0" + date.getDate()).slice(-2) + "/" + ("0" + (date.getMonth() + 1)).slice(-2) + "/" + date.getFullYear();
  //                 let validEnd = date;
  //                 validEnd.setDate(validEnd.getDate() - 1);
  //                 validEnd.setFullYear(validEnd.getFullYear() + 1);
  //                 validEnd = ("0" + validEnd.getDate()).slice(-2) + "/" + ("0" + (validEnd.getMonth() + 1)).slice(-2) + "/" + validEnd.getFullYear();
  //                 val.validityDate = validStart + " - " + validEnd;
  //                 let smeCompany = fullCompany.filter((item) => item.id === val.smeID)[0];
  //                 val.companyName = smeCompany.companyName;
  //                 val.industry = smeCompany.industry;
  //                 // val.Env = Math.round(res.Environment.score);
  //                 // val.Soc = Math.round(res.Social.score);
  //                 // val.Gov = Math.round(res.Governance.score);
  //                 val.score = Math.round(res.overall);
  //                 // val.shared = false;
  //                 let linkDate = new Date(connectedCompanyDetails.find((item) => item.companyId === val.smeID).date);
  //                 val.linkDate = ("0" + linkDate.getDate()).slice(-2) + "/" + ("0" + (linkDate.getMonth() + 1)).slice(-2) + "/" + linkDate.getFullYear();
  //                 if (val.sharedWiths !== null) {
  //                   if (val.sharedWiths.filter((item) => item.corporateID === company.id).length > 0) {
  //                     let status = val.sharedWiths.filter((item) => item.corporateID === company.id)[0].status;
  //                     // if (status === "ACTIVE") {
  //                     //   val.shared = true;
  //                     // }
  //                     val.shared = status;
  //                   }
  //                 }
  //                 if (index === complete.length - 1) {
  //                   setTimeout(() => {
  //                     setSharedAssessment(complete);
  //                     setFullSharedAssessment(complete);
  //                   }, 1000);
  //                 }
  //               })
  //               .catch(() => {});
  //           })
  //           .catch(() => {});
  //       });
  //     })
  //     .catch(() => {});
  // };


  const getContinueAssessment = () => {
    APIHelpers.GET("v1/assessmentEntries?assessmentId=" + continueAssessment.id)
      .then((res) => {
        let fullLength = res.items.length;
        let inProgress = res.items.filter((item) => item.respondStatus !== "TO_START").length;
        let progress = (inProgress / (fullLength - 1)) * 100;
        setCurrentProgress(Math.round(progress));
      })
      .catch(() => {});
  };

  // const getAssessmentLevel = () => {
  //   APIHelpers.GET("v1/assessmentEntries?assessmentId=" + assessment[0].id)
  //     .then((res) => {
  //       IndexCalculation(res.items)
  //         .then((res) => {
  //           if (company.approvedBy !== null) {
  //             setAccessLevel(res);
  //           } else {
  //             setAccessLevel(-1);
  //           }
  //         })
  //         .catch(() => {});
  //     })
  //     .catch(() => {});
  // };

  const getProfile = () => {
    APIHelpers.GET("v1/smeUser")
      .then((res) => {
        res.item.contact = "+" + res.item.contact;
        if (res.item.mobileContact !== "") {
          res.item.mobileContact = "+" + res.item.mobileContact;
        } else {
          res.item.mobileContact = "-";
        }
        let position = res.item.position.split("_");
        res.item.department = position[0];
        res.item.position = position[1];
        setProfile(res.item);
      })
      .catch(() => {});
  };

  const getVendorProfile = () => {
    APIHelpers.GET("v1/admin")
      .then((res) => {
        res.item.companyID = res.item.companyName;
        setProfile(res.item);
      })
      .catch(() => {});
  };

  // const getLearningResource = () => {
  //   APIHelpers.GET("v1/learningResources")
  //     .then((res) => {
  //       let data = new Object();
  //       let tabList = [];
  //       res.items.map((val) => {
  //         if (company.participatedLearning !== null) {
  //           val.completed = company.participatedLearning.includes(val.id) ? true : false;
  //         } else {
  //           val.completed = false;
  //         }
  //       });
  //       LearningList.map((val) => {
  //         tabList.push({
  //           key: val,
  //           tab: val,
  //         });
  //         data[val] = res.items.filter((x) => x.indicator === val).sort((a, b) => a.title.localeCompare(b.title));
  //       });
  //       setLearningData(data);
  //       setLearningTabList(tabList);
  //       setLearningTable(LearningList[0]);
  //     })
  //     .catch(() => {});
  // };

  // const getESGLevel = (value) => {
  //   if (value >= 0 && value < 25) {
  //     return "Beginner";
  //   } else if (value >= 25 && value < 45) {
  //     return "Fair";
  //   } else if (value >= 45 && value < 65) {
  //     return "Good";
  //   } else if (value >= 65 && value < 85) {
  //     return "Progressive";
  //   } else if (value >= 85 && value <= 100) {
  //     return "Exceptional";
  //   }
  // };

  //change tab
  
 
  const docProps = {
    name: "file",
    multiple: true,
    maxCount: 1,
    beforeUpload: (file) => {
      if (file.type !== "application/pdf" && file.type !== "image/png" && file.type !== "image/jpg" && file.type !== "image/jpeg") {
        message.error({
          content: `${file.name} is an invalid file format. Please change the file extension to either .pdf, .png, .jpg, .jpeg.`,
          style: {
            fontSize: "20px",
            marginTop: "100px",
          },
          duration: 8,
        });
        return Upload.LIST_IGNORE;
      } else if (file.size > 5242880) {
        message.error({
          content: `${file.name} is too large. Please upload another document that is smaller than 5MB.`,
          style: {
            fontSize: "20px",
            marginTop: "100px",
          },
          duration: 8,
        });
        return Upload.LIST_IGNORE;
      } else {
        return true;
      }
    },
    onChange(info) {
      if (info.fileList.length > 0) {
        info.fileList[0].status = "done";
        setSSMFile(info.fileList[0].originFileObj);
      }
    },
  };

  const imgProps = {
    name: "file",
    multiple: true,
    maxCount: 1,
    beforeUpload: (file) => {
      if (file.type !== "image/png" && file.type !== "image/jpg" && file.type !== "image/jpeg") {
        message.error({
          content: `${file.name} is an invalid file format. Please change the file extension to either .png, .jpg, .jpeg.`,
          style: {
            fontSize: "20px",
            marginTop: "100px",
          },
          duration: 8,
        });
        return Upload.LIST_IGNORE;
      } else if (file.size > 5242880) {
        message.error({
          content: `${file.name} is too large. Please upload another document that is smaller than 5MB.`,
          style: {
            fontSize: "20px",
            marginTop: "100px",
          },
          duration: 8,
        });
        return Upload.LIST_IGNORE;
      } else {
        return true;
      }
    },
    onChange(info) {
      if (info.fileList.length > 0) {
        info.fileList[0].status = "done";
        setLogo(info.fileList[0].originFileObj);
      }
    },
  };

  // const updateLogo = () => {
  //   let form = new FormData();
  //   form.append("profilePicture", logo);
  //   APIHelpers.PUT("v1/sme?id=" + company.id, form, {
  //     "Content-Type": "multipart/form-data",
  //   })
  //     .then(() => {
  //       let data = {
  //         linkedWiths: company.linkedWiths,
  //         participatedLearning: company.participatedLearning,
  //       };
  //       APIHelpers.PUT("v1/sme?id=" + company.id, data)
  //         .then(() => {
  //           message.success({
  //             content: "Your Company Logo was successfully uploaded.",
  //             style: {
  //               fontSize: "20px",
  //               marginTop: "100px",
  //             },
  //             duration: 5,
  //           });
  //           setUploadLogoVisible(false);
  //           setLogo(null);
  //           getCompany();
  //         })
  //         .catch(() => {
  //           message.error({
  //             content: "Your Company Logo was not uploaded.",
  //             style: {
  //               fontSize: "20px",
  //               marginTop: "100px",
  //             },
  //             duration: 8,
  //           });
  //         });
  //     })
  //     .catch(() => {
  //       message.error({
  //         content: "Your Company Logo was not uploaded.",
  //         style: {
  //           fontSize: "20px",
  //           marginTop: "100px",
  //         },
  //         duration: 8,
  //       });
  //     });
  // };

  // const showUploadModal = () => {
  //   return (
  //     <Modal visible={uploadLogoVisible} className="Modal-rounded-login" footer={null} onCancel={() => setUploadLogoVisible(false)} width={700}>
  //       <div className="bg-darkprimary px-8 py-8 text-white rounded-t-xl">
  //         <p className="font-bold text-base 1000:text-lg">Upload Company Logo</p>
  //       </div>
  //       <div className="px-8 pt-8 pb-4 flex justify-center">
  //         <Upload {...imgProps}>
  //           <Button className="text-#21324E flex justify-center items-center bg-white border-#21324E w-full py-4 px-8 whitespace-pre-wrap	text-sm 1000:text-base font-semibold hover:bg-white focus:bg-white hover:text-#21324E focus:text-#21324E gap-x-2 hover:border-#21324E focus:border-#21324E border-4">
  //             <UploadOutlined />
  //             <p>Upload</p>
  //           </Button>
  //         </Upload>
  //       </div>
  //       <div className="px-8 pt-4 pb-8 flex justify-center">
  //         <Button className="bg-#21324E text-white hover:bg-#21324E focus:bg-#21324E hover:text-white focus:text-white" onClick={() => updateLogo()} disabled={logo === null ? true : false}>
  //           Submit
  //         </Button>
  //       </div>
  //     </Modal>
  //   );
  // };

  // const updateCompanyProfile = (values) => {
  //   let form = new FormData();
  //   if (company) {
  //     ssmFile !== null ? form.append("ssmDoc", ssmFile) : null;
  //     form.append("state", values.state);
  //     form.append("postCode", values.postCode);
  //     form.append("msic", values.msic);
  //     form.append("companyName", values.name);
  //     form.append("businessEntity", values.businessEntity);
  //     form.append("registeredInEastMy", selectRegistered);
  //     values.smeCorpRegistrationNumber !== undefined ? form.append("smeCorpRegistrationNumber", values.smeCorpRegistrationNumber) : null;
  //     company.ssmNumber !== values.ssmNum ? form.append("ssmNumber", values.ssmNum) : null;
  //     company.oldSSMNumber !== values.oldSsmNum ? form.append("oldSSMNumber", values.oldSsmNum) : null;
  //     APIHelpers.PUT("v1/sme?id=" + company.id, form, {
  //       "Content-Type": "multipart/form-data",
  //     })
  //       .then(() => {
  //         let data = {
  //           linkedWiths: company.linkedWiths,
  //           participatedLearning: company.participatedLearning,
  //         };
  //         APIHelpers.PUT("v1/sme?id=" + company.id, data)
  //           .then(() => {
  //             setEditCompanyProfileVisible(false);
  //             message.success({
  //               content: "Your Company Profile has been updated.",
  //               style: {
  //                 fontSize: "20px",
  //                 marginTop: "100px",
  //               },
  //               duration: 5,
  //             });
  //             edit.resetFields();
  //             setCompany([]);
  //             getCompany();
  //           })
  //           .catch(() => {
  //             message.error({
  //               content: "Your Company Profile was not updated.",
  //               style: {
  //                 fontSize: "20px",
  //                 marginTop: "100px",
  //               },
  //               duration: 8,
  //             });
  //           });
  //       })
  //       .catch((err) => {
  //         if ("response" in err) {
  //           if ("data" in err.response) {
  //             if ("error" in err.response.data) {
  //               if ("code" in err.response.data.error) {
  //                 if (err.response.data.error.code.includes("ssm_number_found")) {
  //                   message.error({
  //                     content: "Your Company Profile was not updated. Business Registration Number has been used.",
  //                     style: {
  //                       fontSize: "20px",
  //                       marginTop: "100px",
  //                     },
  //                     duration: 8,
  //                   });
  //                 } else if (err.response.data.error.code.includes("company_name_found")) {
  //                   message.error({
  //                     content: "Your Company Profile was not updated. Company Name has been used.",
  //                     style: {
  //                       fontSize: "20px",
  //                       marginTop: "100px",
  //                     },
  //                     duration: 8,
  //                   });
  //                 } else {
  //                   message.error({
  //                     content: "Your Company Profile was not updated.",
  //                     style: {
  //                       fontSize: "20px",
  //                       marginTop: "100px",
  //                     },
  //                     duration: 8,
  //                   });
  //                 }
  //               }
  //             }
  //           }
  //         } else {
  //           message.error({
  //             content: "Your Company Profile was not updated.",
  //             style: {
  //               fontSize: "20px",
  //               marginTop: "100px",
  //             },
  //             duration: 8,
  //           });
  //         }
  //       });
  //   }
  // };

  // const showEditCompanyProfile = () => {
  //   return (
  //     <Modal visible={editCompanyProfileVisible} className="Modal-rounded" footer={null} onCancel={() => setEditCompanyProfileVisible(false)} width={700} bodyStyle={{ overflowY: "scroll" }}>
  //       <div className="bg-darkprimary px-8 py-8 text-white rounded-t-xl">
  //         <p className="font-bold text-base 1000:text-lg">Edit Company Profile</p>
  //       </div>
  //       <p className="text-formTitleGreen font-semibold text-sm 1000:text-base px-8 mt-8">Company Information</p>
  //       <div className="px-8 py-4">
  //         <Form layout="vertical" onFinish={updateCompanyProfile} form={edit}>
  //           <Form.Item label={<p className="font-semibold text-xs 1000:text-sm">Company Name</p>} name="name" hasFeedback>
  //             <Input maxLength={100} disabled={company.approvedBy !== null ? true : false} />
  //           </Form.Item>
  //           <Form.Item label={<p className="font-semibold text-xs 1000:text-sm">Business / Organisation Type</p>} name="businessEntity" hasFeedback>
  //             <Select onChange={(value) => setSelectEntity(value)} disabled={company.approvedBy !== null ? true : false}>
  //               {BUSINESSENTITY.map((val) => (
  //                 <Option value={val.key}>{val.data}</Option>
  //               ))}
  //             </Select>
  //           </Form.Item>
  //           <Form.Item label={<p className="font-semibold text-xs 1000:text-sm">Business / Organisation registered in Sabah or Sarawak?</p>} name="registeredInEastMY" hasFeedback>
  //             <Select onChange={(value) => setSelectRegistered(value)} disabled={company.approvedBy !== null ? true : selectEntity === "GOVERNMENT" ? true : false}>
  //               <Option value={true}>Yes</Option>
  //               <Option value={false}>No</Option>
  //             </Select>
  //           </Form.Item>
  //           <Form.Item label={<p className="font-semibold text-xs 1000:text-sm">Education Institution Type</p>} name="educationType" hasFeedback>
  //             <Select onChange={(value) => setSelectEducation(value)} disabled={company.approvedBy !== null ? true : selectEntity === "EDUCATIONAL_INSTITUTION" ? false : true}>
  //               <Option value={"public"}>Public</Option>
  //               <Option value={"private"}>Private</Option>
  //             </Select>
  //           </Form.Item>
  //           <Form.Item label={<p className="font-semibold text-xs 1000:text-sm">Business / Organisation Registration Number (i.e. SSM / ROS number)</p>} name="ssmNum" hasFeedback>
  //             <Input
  //               type={isSSM === 1 ? "number" : ""}
  //               maxLength={24}
  //               disabled={company.approvedBy !== null ? true : selectEntity === "GOVERNMENT" || (selectEntity === "EDUCATIONAL_INSTITUTION" && selectEducation === "public") ? true : false}
  //               onChange={(value) => {
  //                 let val = value.target.value.replace(/[^0-9a-z]/gi, "");
  //                 edit.setFieldsValue({
  //                   ssmNum: val,
  //                 });
  //               }}
  //             />
  //           </Form.Item>
  //           <Form.Item label={<p className="font-semibold text-xs 1000:text-sm">Business / Organisation Registration File</p>} name="ssmFile" hasFeedback className={company.approvedBy !== null ? "hidden" : "visible"}>
  //             <Upload {...docProps}>
  //               <Button className="text-white flex items-center py-2 px-4 bg-gradient-to-t from-#DF3B57 to-#DF3B57CC hover:bg-gradient-to-t focus:bg-gradient-to-tC hover:text-white focus:text-white">
  //                 <UploadOutlined className="text-xl text-white" />
  //                 Upload File
  //               </Button>
  //             </Upload>
  //           </Form.Item>
  //           <div className="flex justify-between">
  //             <Form.Item label={<p className="font-semibold text-xs 1000:text-sm">State</p>} name="state" hasFeedback className="w-49%">
  //               <Select
  //                 onChange={(value) => {
  //                   setSelectState(value.replace(/\s/g, ""));
  //                   edit.setFieldsValue({ postCode: "" });
  //                 }}
  //                 disabled={company.approvedBy !== null ? true : false}
  //               >
  //                 {STATE.map((val) => (
  //                   <Option value={val}>{val}</Option>
  //                 ))}
  //               </Select>
  //             </Form.Item>
  //             <Form.Item label={<p className="font-semibold text-xs 1000:text-sm">Postcode</p>} name="postCode" hasFeedback className="w-49%">
  //               <Select showSearch optionFilterProp="children" disabled={company.approvedBy !== null ? true : selectState === "" ? true : false}>
  //                 {selectState !== "" ? POSTCODE[selectState].map((val) => <Option value={val}>{val}</Option>) : null}
  //               </Select>
  //             </Form.Item>
  //           </div>
  //           <Form.Item label={<p className="font-semibold text-xs 1000:text-sm">MSIC</p>} name="msic" hasFeedback>
  //             <Select style={{ width: "100%" }} disabled={company.approvedBy !== null ? true : selectEntity === "GOVERNMENT" || (selectEntity === "EDUCATIONAL_INSTITUTION" && selectEducation === "public") ? true : false}>
  //               {shopMSIC}
  //             </Select>
  //           </Form.Item>
  //           <Form.Item className="mb-2 text-right ">
  //             <Button htmlType="submit" disabled={company.approvedBy !== null ? true : false} className="px-8 rounded-lg bg-gradient-to-t from-#DF3B57 to-#DF3B57CC text-white hover:bg-gradient-to-t focus:bg-gradient-to-t hover:text-white focus:text-white">
  //               SAVE
  //             </Button>
  //           </Form.Item>
  //         </Form>
  //       </div>
  //     </Modal>
  //   );
  // };

  // const shopMSIC = MSIC.map((row) => {
  //   return (
  //     <Option value={row.code}>
  //       {row.code} - {row.industry}
  //     </Option>
  //   );
  // });

  // const confirmToDelete = (values, name) => {
  //   Modal.confirm({
  //     okText: "Confirm",
  //     cancelText: "Cancel",
  //     title: "Confirm to delete " + name + " from authorised users?",
  //     icon: <ExclamationCircleOutlined />,
  //     onOk() {
  //       deactivateUser(values);
  //     },
  //   });
  // };

  // const deactivateUser = (values) => {
  //   let data = {
  //     status: "INACTIVE",
  //   };
  //   APIHelpers.PUT("v1/smeUser?id=" + values, data)
  //     .then(() => {
  //       message.success({
  //         content: "Authorised User has been deleted.",
  //         style: {
  //           fontSize: "20px",
  //           marginTop: "100px",
  //         },
  //         duration: 5,
  //       });
  //       getSMEUsers();
  //     })
  //     .catch(() => {
  //       message.error({
  //         content: "Authorised User was not deleted.",
  //         style: {
  //           fontSize: "20px",
  //           marginTop: "100px",
  //         },
  //         duration: 8,
  //       });
  //     });
  // };

  const showDownload = () => {
    return (
      <Modal visible={isDownload} className="" footer={null} closable={false} width={600}>
        <div className="flex justify-center items-center gap-x-4">
          <Spin indicator={<LoadingOutlined spin />} />
          <p className="font-semibold text-base 1000:text-lg">Please wait for your report to be downloaded.</p>
        </div>
      </Modal>
    );
  };



  return (
    <Layout className="min-h-full">
      <Header></Header>
      
      <Content className="bg-white 1150:px-12 px-8 min-h-9/10 w-full pb-16">
      <DashPage></DashPage>
        {/* <Row className="flex mt-8 min-h-8/10 gap-x-8 justify-between "> */}
          <Col className="w-full 1150:w-9/12 block 1150:hidden mb-4">

          </Col>
          
          <Col className="w-full 1150:w-5/5">
            
          
          </Col>
              <Col className="bg-white p-4 w-full 1150:w-5/5 1150:flex shadow-md rounded-lg border-2">
             
                <Row className="1150:w-9/12 1150:flex">
                  <div className="w-full">
                  
                    <div className="flex justify-between pr-10">
                      <p className="font-semibold text-sm 1000:text-base" style={{color: 'purple'}}>My Current Assessment</p>
                    </div>
                    <p className="font-semibold text-xs" style={{color: 'purple'}}>Assessment Progress</p>
                    <Progress percent={currentProgress} format={(percent) => <p className="text-black">{percent + "%"}</p>} />
                    {Object.keys(continueAssessment).length > 0 ? (
                      <p className="font-semibold text-sm 1000:text-base mt-2">
                        <span className="text-red-500">Note:</span> Your ESG Assessment Report can only be generated if your Company Profile status has been “Verified”.{" "}
                      </p>
                    ) : lastAssessment === "" ? (
                      <p className="font-semibold text-sm 1000:text-base mt-2">
                        <span className="text-red-500">Note:</span> Your ESG Assessment Report can only be generated if your Company Profile status has been “Verified”.{" "}
                      </p>
                    ) : (
                      <p className="font-semibold text-sm 1000:text-base mt-2">
                        <span className="text-red-500">Note:</span> You are allowed to complete the Assessment once every 6 months.{" "}
                      </p>
                    )}
                  </div>
                </Row>

                <Row className="1150:flex 1150:w-1/4 justify-center p-4 items-center">
                  {Object.keys(continueAssessment).length > 0 ? (
                    <Button className="text-white flex justify-center items-center bg-#21324E w-full py-4 max-h-20 max-w-xs whitespace-pre-wrap	text-sm 1000:text-base font-semibold hover:bg-#21324E focus:bg-#21324E hover:text-white focus:text-white" onClick={() => router.push("/esg/assessment?id=" + company.id)}>
                      <p>
                        Continue
                        <br />
                        Assessment
                      </p>
                    </Button>
                  ) : lastAssessment === "" ? (
                    <Button className="text-white flex justify-center items-center bg-#21324E w-full py-4 max-h-20 whitespace-pre-wrap text-sm 1000:text-base font-semibold hover:bg-#21324E focus:bg-#21324E hover:text-white focus:text-white" onClick={() => router.push("/esg/assessment?id=" + company.id)}>
                      <p>
                        New
                        <br />
                        Assessment
                      </p>
                    </Button>
                  ) : (
                    <Button className="text-white flex justify-center items-center cursor-not-allowed bg-assessmentDraft w-full py-4 max-h-20 whitespace-pre-wrap	text-sm 1000:text-base font-semibold hover:bg-assessmentDraft focus:bg-assessmentDraft hover:text-white focus:text-white">
                      <p>
                        Next
                        <br />
                        Assessment
                      </p>
                    </Button>
                  )}
                  {Object.keys(continueAssessment).length === 0 && lastAssessment !== "" ? <p className="font-bold text-sm 1000:text-base">{lastAssessment}</p> : null}
                </Row>
              </Col>
          
            <Row className="mt-8 rounded-lg">
            
              {reportID !== "" ? shareReport() : null}
              {/* {showUploadModal()} */}
              {/* {showEditCompanyProfile()} */}
              {showDownload()}
            
 
            {/* </Row> */}
          {/* </Col> */}
        </Row>
      </Content>
      <Footer />
    </Layout>
  );
}

export default QuestionnairePage;
