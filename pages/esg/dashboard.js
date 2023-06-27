import { Button, Layout, Row, Col, Progress, Tag, Table, Card, Modal, Input, Form, Tooltip, Checkbox, message, Upload, Select, Spin } from "antd";
import Header from "./header";
import UserImage from "../../assests/img/companyLogo.png";
import Footer from "../footer";
import DashPage from "./top";
import APIHelpers from "../api/apiHelper";
import { CheckOutlined, CloseOutlined, DeleteOutlined, DownloadOutlined, EditOutlined, ExclamationCircleOutlined, EyeOutlined, InfoCircleOutlined, LoadingOutlined, PlusOutlined, ShareAltOutlined, UploadOutlined, UserAddOutlined, UserDeleteOutlined, UserOutlined, UserSwitchOutlined } from "@ant-design/icons";
import Search from "antd/lib/input/Search";
import { DIMENSION} from "../../compenents/config";
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

function HomePage() {
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
  const [score, setScore] = useState({});
  const [allScore, setAllScore] = useState({});

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
      getSMEUsers();
      getSME();
   
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
      getAssessmentLevel();
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



  const getSME = () => {
    APIHelpers.GET("v1/smes")
      .then((res) => {
        if (res.items) {
          let filter = res.items.filter((item) => item.id !== company.id && !linkedCompany.includes(item.id));
          filter.map((val) => {
            val.industry = MSIC.filter((item) => item.code === val.msic)[0].industry;
          });
          setFullCompany(filter);
        }
      })
      .catch(() => {});
  };

  const getReqConnections = () => {
    APIHelpers.GET("v1/connections?requestCompanyID=" + company.id)
      .then((res) => {
        setReqConnection(res.items);
      })
      .catch(() => {});
  };

  const getRecConnections = () => {
    APIHelpers.GET("v1/connections?receivedCompanyID=" + company.id)
      .then((res) => {
        setRecConnection(res.items);
      })
      .catch(() => {});
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

  

  const getAllAssessment = () => {
    APIHelpers.GET("v1/assessments")
      .then((res) => {
        let complete = res.items.filter((item) => connectedCompany.includes(item.smeID) && item.completionDate !== "0001-01-01T00:00:00Z");
        if (complete.length > 0) {
          setPortfolioDataReady(portfolioDataReady + 1);
          setPortfolioData(complete);
        }
        complete = complete.sort((a, b) => new Date(b.completionDate) - new Date(a.completionDate));
        complete.map((val, index) => {
          APIHelpers.GET("v1/assessmentEntries?assessmentId=" + val.id)
            .then((res) => {
              ESGCalculation(res.items)
                .then((res) => {
                  let date = new Date(val.completionDate);
                  val.oriDate = date;
                  val.formatCompletionDate = ("0" + date.getDate()).slice(-2) + "/" + ("0" + (date.getMonth() + 1)).slice(-2) + "/" + date.getFullYear();
                  let validStart = ("0" + date.getDate()).slice(-2) + "/" + ("0" + (date.getMonth() + 1)).slice(-2) + "/" + date.getFullYear();
                  let validEnd = date;
                  validEnd.setDate(validEnd.getDate() - 1);
                  validEnd.setFullYear(validEnd.getFullYear() + 1);
                  validEnd = ("0" + validEnd.getDate()).slice(-2) + "/" + ("0" + (validEnd.getMonth() + 1)).slice(-2) + "/" + validEnd.getFullYear();
                  val.validityDate = validStart + " - " + validEnd;
                  let smeCompany = fullCompany.filter((item) => item.id === val.smeID)[0];
                  val.companyName = smeCompany.companyName;
                  val.industry = smeCompany.industry;
                  // val.Env = Math.round(res.Environment.score);
                  // val.Soc = Math.round(res.Social.score);
                  // val.Gov = Math.round(res.Governance.score);
                  val.score = Math.round(res.overall);
                  // val.shared = false;
                  let linkDate = new Date(connectedCompanyDetails.find((item) => item.companyId === val.smeID).date);
                  val.linkDate = ("0" + linkDate.getDate()).slice(-2) + "/" + ("0" + (linkDate.getMonth() + 1)).slice(-2) + "/" + linkDate.getFullYear();
                  if (val.sharedWiths !== null) {
                    if (val.sharedWiths.filter((item) => item.corporateID === company.id).length > 0) {
                      let status = val.sharedWiths.filter((item) => item.corporateID === company.id)[0].status;
                      // if (status === "ACTIVE") {
                      //   val.shared = true;
                      // }
                      val.shared = status;
                    }
                  }
                  if (index === complete.length - 1) {
                    setTimeout(() => {
                      setSharedAssessment(complete);
                      setFullSharedAssessment(complete);
                    }, 1000);
                  }
                })
                .catch(() => {});
            })
            .catch(() => {});

            
        });
      })
      .catch(() => {});
      
  };

  const getSMEUsers = () => {
    APIHelpers.GET("v1/smeUsers?companyId=" + company.id)
      .then((res) => {
        if (res.items) {
          let data = res.items.filter((item) => item.id !== profile.id && item.status === "ACTIVE");
          if (data.length > 0) {
            data.map((val) => {
              val.contact = "+" + val.contact;
              if (val.mobileContact !== "") {
                val.mobileContact = "+" + val.mobileContact;
              } else {
                val.mobileContact = "-";
              }
              let position = val.position.split("_");
              val.department = position[0];
              val.position = position[1];
            });
          }
          setSmeUsers(data);
        }
      })
      .catch(() => {});
  };

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

  const getAssessmentLevel = () => {
    APIHelpers.GET("v1/assessmentEntries?assessmentId=" + assessment[0].id)
      .then((res) => {
        IndexCalculation(res.items)
          .then((res) => {
            if (company.approvedBy !== null) {
              setAccessLevel(res);
            } else {
              setAccessLevel(-1);
            }
          })
          .catch(() => {});
      })
      .catch(() => {});
  };

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



  //change tab
  const changeReportTab = (key) => {
    setReportTable(key);
  };


  //table
  const assestmentReportTable = () => {
    return (
      <div className="">
        <div className="flex justify-end">
          <Search
            className="self-end flex w-auto"
            maxLength={20}
            onSearch={(value) => {
              setCompletedAssessment([]);
              SearchFilter(fullCompletedAssessment, value)
                .then((res) => {
                  setCompletedAssessment(res);
                })
                .catch(() => {
                  setCompletedAssessment(fullCompletedAssessment);
                });
            }}
          />
        </div>
        <Table
          className="mt-4 titleRow"
          dataSource={[...completedAssessment]}
          scroll={{ x: 800 }}
          locale={{
            emptyText: <p className="text-black italic">There are no results that match your search.</p>,
          }}
          pagination={{
            position: ["bottomLeft"],
            defaultPageSize: 5,
            showSizeChanger: true,
            pageSizeOptions: [5, 10, 20, 50, 100],
          }}
        >
          <Column
            title={<p className="text-xs 1000:text-sm">Assessment ID</p>}
            sorter={(a, b) => a.serialNo.localeCompare(b.serialNo)}
            showSorterTooltip={false}
            render={(row) => {
              return <p className="text-xs 1000:text-sm">{company.approvedBy !== null ? row.serialNo : "Unknown"}</p>;
            }}
          />
          <Column
            title={<p className="text-xs 1000:text-sm">Completion Date</p>}
            sorter={(a, b) => moment(a.oriDate).unix() - moment(b.oriDate).unix()}
            showSorterTooltip={false}
            render={(row) => {
              return <p className="text-xs 1000:text-sm">{company.approvedBy !== null ? row.formatCompletionDate : "Unknown"}</p>;
            }}
          />
          <Column
            title={<p className="text-xs 1000:text-sm">Report Validity</p>}
            sorter={(a, b) => moment(a.oriDate).unix() - moment(b.oriDate).unix()}
            showSorterTooltip={false}
            render={(row) => {
              return <p className="text-xs 1000:text-sm">{company.approvedBy !== null ? row.validityDate : "Unknown"}</p>;
            }}
          />
          <Column
            title={<p className="text-xs 1000:text-sm">ESG Maturity Level</p>}
            render={(row) => {
              return (
                <div className="flex gap-x-2 items-center">
                  <span className={company.approvedBy !== null ? "w-10 text-xs 1000:text-sm" : "text-xs 1000:text-sm"}>{company.approvedBy !== null ? row.score + "%" : "Unknown"}</span>
                  {company.approvedBy !== null ? <p className="text-xs 1000:text-sm">{getESGLevel(row.score)}</p> : null}
                </div>
              );
            }}
            sorter={(a, b) => a.score - b.score}
            showSorterTooltip={false}
          ></Column>
          <Column title={<p className="text-xs 1000:text-sm">Shared</p>} render={(row) => <p className="text-xs 1000:text-sm">{row.sharedWiths !== null ? row.sharedWiths.filter((item) => item.status === "ACTIVE").length : 0}</p>}></Column>
          <Column
            title=""
            render={(row) => {
              return (
                <div className="flex gap-x-4 items-center text-xs 1000:text-sm">
                  {company.approvedBy !== null ? (
                    <Tooltip title="View">
                      <EyeOutlined
                        className="text-view cursor-pointer"
                        onClick={() => {
                          let link = document.createElement("a");
                          link.target = "_blank";
                          link.href = WEBURL + "/esg/indivReport?id=" + row.id + "&token=" + sessionStorage.getItem("accessToken");
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }}
                      />
                    </Tooltip>
                  ) : (
                    <Tooltip title="Pending verification">
                      <EyeOutlined className="text-gray-400 cursor-not-allowed" />
                    </Tooltip>
                  )}
                  {company.approvedBy !== null ? (
                    <Tooltip title="Download">
                      <DownloadOutlined
                        className="text-share cursor-pointer"
                        onClick={() => {
                          setIsDownload(true);
                          let data = REPORTURL + "/esg?target=" + WEBURL + "/esg/indivPdf?id=" + row.id + "&accessToken=" + sessionStorage.getItem("accessToken");
                          let req = new XMLHttpRequest();
                          req.open("GET", data, true);
                          req.responseType = "blob";
                          req.onload = function () {
                            //Convert the Byte Data to BLOB object.
                            let blob = new Blob([req.response], { type: "application/octetstream" });
                            //Check the Browser type and download the File.
                            let isIE = false || !!document.documentMode;
                            if (isIE) {
                              window.navigator.msSaveBlob(blob, fileName);
                              setIsDownload(false);
                            } else {
                              let url = window.URL || window.webkitURL;
                              let link = url.createObjectURL(blob);
                              let a = document.createElement("a");
                              a.setAttribute("download", company.companyName + ".pdf");
                              a.target = "_blank";
                              a.setAttribute("href", link);
                              document.body.appendChild(a);
                              a.click();
                              document.body.removeChild(a);
                              setIsDownload(false);
                            }
                          };
                          req.send();
                        }}
                      />
                    </Tooltip>
                  ) : (
                    <Tooltip title="Pending verification">
                      <DownloadOutlined className="text-gray-400 cursor-not-allowed" />
                    </Tooltip>
                  )}
                  {company.approvedBy !== null ? (
                    <Tooltip title="Share">
                      <ShareAltOutlined
                        className="text-orange-400 cursor-pointer"
                        onClick={() => {
                          setReportID(row.id);
                          setReportSerialNo(row.serialNo);
                          setShareReportModalVisible(true);
                        }}
                      />
                    </Tooltip>
                  ) : (
                    <Tooltip title="Pending verification">
                      <ShareAltOutlined className="text-gray-400 cursor-not-allowed" />
                    </Tooltip>
                  )}
                </div>
              );
            }}
          ></Column>
        </Table>
      </div>
    );
  };

  const corporateReportTable = () => {
    return (
      <div>
        <div className="flex justify-between">
          <p className="text-sm 1000:text-base">Connections: {fullLinkedCompany.filter((item) => item.status === "Connected").length}</p>
          <div className="flex gap-x-4">
            <Button className="bg-#21324E text-white text-xs 1000:text-sm flex items-center font-semibold hover:bg-#21324E focus:bg-#21324E hover:text-white focus:text-white" onClick={() => setNewConnectionVisible(true)}>
              <PlusOutlined />
              New Connection
            </Button>
            <Search
              className="self-end flex w-auto"
              maxLength={20}
              onSearch={(value) => {
                setLinkCompany([]);
                SearchFilter(fullLinkedCompany, value)
                  .then((res) => {
                    setLinkCompany(res);
                  })
                  .catch(() => {
                    setLinkCompany(fullLinkedCompany);
                  });
              }}
            />
          </div>
        </div>
        <Table
          className="mt-4 titleRow"
          dataSource={[...linkedCompany]}
          scroll={{ x: 800 }}
          locale={{
            emptyText: <p className="text-black italic">There are no results that match your search.</p>,
          }}
          pagination={{
            position: ["bottomLeft"],
            onChange: setPage,
            defaultPageSize: 5,
            showSizeChanger: true,
            pageSizeOptions: [5, 10, 20, 50, 100],
          }}
        >
          <Column title={<p className="text-xs 1000:text-sm">No</p>} width={50} render={(row, record, index) => <p className="text-xs 1000:text-sm">{(page - 1) * 5 + index + 1}</p>} />
          <Column title={<p className="text-xs 1000:text-sm">Company Name</p>} width={800} dataIndex="companyName" render={(row) => <p className="text-xs 1000:text-sm">{row}</p>} />
          <Column title={<p className="text-xs 1000:text-sm">Date Connected</p>} dataIndex="linkDate" render={(row) => <p className="text-xs 1000:text-sm">{row}</p>} />
          <Column title={<p className="text-xs 1000:text-sm">Status</p>} dataIndex="status" render={(row) => <p className="text-xs 1000:text-sm">{row}</p>} />
          <Column
            title={<p className="text-xs 1000:text-sm">Disconnect</p>}
            render={(row) => {
              return (
                <div className="flex gap-x-4 items-center text-xs 1000:text-sm">
                  {row.status === "Pending" && row.role === "receiver" ? (
                    <Tooltip title="Connect">
                      <UserAddOutlined className="text-share cursor-pointer text-xs 1000:text-sm" onClick={() => confirmConnect(row)} />
                    </Tooltip>
                  ) : row.status === "Pending" && row.role === "requestor" ? (
                    <Tooltip title="Pending">
                      <UserSwitchOutlined className="text-gray-400 text-xs 1000:text-sm" />
                    </Tooltip>
                  ) : null}
                  <Tooltip title="Disconnect">
                    <UserDeleteOutlined className="text-red-500 cursor-pointer text-xs 1000:text-sm" onClick={() => confirmDisconnect(row)} />
                  </Tooltip>
                </div>
              );
            }}
          ></Column>
        </Table>
      </div>
    );
  };

  
  const singleEntityReportTable = () => {
    console.log("TEST:1 =>Report sharing issue");
    return (
      <div>
        <div className="flex justify-between">
        <p className="text-xs 1000:text-sm">Report Shared: {fullSharedAssessment.filter((item) => item.shared === "ACTIVE").length}</p>
          <Search
            className="self-end flex w-auto"
            maxLength={20}
            onSearch={(value) => {
              setSharedAssessment([]);
              SearchFilter(fullSharedAssessment, value)
                .then((res) => {
                  setSharedAssessment(res);
                })
                .catch(() => {
                  setSharedAssessment(fullSharedAssessment);
                });
            }}
          />
        </div>
        <Table
          className="mt-4 titleRow"
          dataSource={[...sharedAssessment]}
          scroll={{ x: 800 }}
          locale={{
            emptyText: <p className="text-black italic">There are no results that match your search.</p>,
          }}
          pagination={{
            position: ["bottomLeft"],
            defaultPageSize: 5,
            showSizeChanger: true,
            pageSizeOptions: [5, 10, 20, 50, 100],
          }}
        >
          <Column title={<p className="text-xs 1000:text-sm">Connection Date</p>} dataIndex="linkDate" sorter={(a, b) => moment(a.linkDate).unix() - moment(b.linkDate).unix()} showSorterTooltip={false} render={(row) => <p className="text-xs 1000:text-sm">{row}</p>} />
          <Column title={<p className="text-xs 1000:text-sm">Company Name</p>} dataIndex="companyName" sorter={(a, b) => a.companyName.localeCompare(b.companyName)} showSorterTooltip={false} render={(row) => <p className="text-xs 1000:text-sm">{row}</p>} />
          <Column
            title={<p className="text-xs 1000:text-sm">Sector</p>}
            dataIndex="industry"
            ellipsis={{ showTitle: false }}
            width={200}
            sorter={(a, b) => a.industry.localeCompare(b.industry)}
            showSorterTooltip={false}
            render={(industry) => (
              <Tooltip placement="topLeft" title={industry}>
                {industry}
              </Tooltip>
            )}
          />
          <Column
            title={<p className="text-xs 1000:text-sm">Assessment ID</p>}
            dataIndex="serialNo"
            sorter={(a, b) => a.serialNo.localeCompare(b.serialNo)}
            showSorterTooltip={false}
            render={(_, record) => {
              return (
                <div className="flex gap-x-2 items-center text-xs 1000:text-sm">
                  <span>{record.shared === "ACTIVE" ? record.serialNo : "Unknown"}</span>
                </div>
              );
            }}
          />
          <Column
            title={<p className="text-xs 1000:text-sm">Completion Date</p>}
            dataIndex="formatCompletionDate"
            sorter={(a, b) => moment(a.oriDate).unix() - moment(b.oriDate).unix()}
            showSorterTooltip={false}
            render={(_, record) => {
              return (
                <div className="flex gap-x-2 items-center text-xs 1000:text-sm">
                  <span>{record.shared === "ACTIVE" ? record.formatCompletionDate : "Unknown"}</span>
                </div>
              );
            }}
          />
          <Column
            title={<p className="text-xs 1000:text-sm">Report Validity</p>}
            dataIndex="validityDate"
            sorter={(a, b) => moment(a.oriDate).unix() - moment(b.oriDate).unix()}
            showSorterTooltip={false}
            render={(_, record) => {
              return (
                <div className="flex gap-x-2 items-center text-xs 1000:text-sm">
                  <span>{record.shared === "ACTIVE" ? record.validityDate : "Unknown"}</span>
                </div>
              );
            }}
          />
          <Column
            title={<p className="text-xs 1000:text-sm">ESG Score</p>}
            render={(row) => {
              return (
                <div className="flex gap-x-2 items-center">
                  <span className={row.shared === "ACTIVE" ? "w-10 text-xs 1000:text-sm" : "text-xs 1000:text-sm"}>{row.shared === "ACTIVE" ? row.score + "%" : "Unknown"}</span>
                  {row.shared === "ACTIVE" ? <p className="text-xs 1000:text-sm">{getESGLevel(row.score)}</p> : null}
                </div>
              );
            }}
            sorter={(a, b) => a.score - b.score}
            showSorterTooltip={false}
          ></Column>
          <Column
            title={<p className="text-xs 1000:text-sm">Request to Share</p>}
            render={(row) => {
              return (
                <div className="flex gap-x-4 items-center text-xs 1000:text-sm">
                  {row.shared === "ACTIVE" ? (
                    <p className="text-xs 1000:text-sm">Shared</p>
                  ) : row.shared === "INVITED" ? (
                    <p className="text-xs 1000:text-sm">Requested</p>
                  ) : (
                    <Tooltip title="Request to share">
                      <ShareAltOutlined className="text-orange-400 cursor-pointer text-xs 1000:text-sm" onClick={() => confirmRequest(row)} />
                    </Tooltip>
                  )}
                </div>
              );
            }}
          ></Column>
          <Column
            title=""
            render={(row) => {
              return (
                <div className="flex gap-x-4 items-center text-xs 1000:text-sm">
                  {row.shared === "ACTIVE" ? (
                    <Tooltip title="View">
                      <EyeOutlined
                        className="text-view cursor-pointer"
                        onClick={() => {
                          let link = document.createElement("a");
                          link.target = "_blank";
                          link.href = WEBURL + "/esg/indivReport?id=" + row.id + "&token=" + sessionStorage.getItem("accessToken");
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }}
                      />
                    </Tooltip>
                  ) : null}
                  {row.shared === "ACTIVE" ? (
                    <Tooltip title="Download">
                      <DownloadOutlined
                        className="text-share cursor-pointer"
                        onClick={() => {
                          setIsDownload(true);
                          let data = REPORTURL + "/esg?target=" + WEBURL + "/esg/indivPdf?id=" + row.id + "&accessToken=" + sessionStorage.getItem("accessToken") + "&role=corporate";
                          let req = new XMLHttpRequest();
                          req.open("GET", data, true);
                          req.responseType = "blob";
                          req.onload = function () {
                            //Convert the Byte Data to BLOB object.
                            let blob = new Blob([req.response], { type: "application/octetstream" });
                            //Check the Browser type and download the File.
                            let isIE = false || !!document.documentMode;
                            if (isIE) {
                              window.navigator.msSaveBlob(blob, row.companyName + ".pdf");
                              setIsDownload(false);
                            } else {
                              let url = window.URL || window.webkitURL;
                              let link = url.createObjectURL(blob);
                              let a = document.createElement("a");
                              a.setAttribute("download", row.companyName + ".pdf");
                              a.target = "_blank";
                              a.setAttribute("href", link);
                              document.body.appendChild(a);
                              a.click();
                              document.body.removeChild(a);
                              setIsDownload(false);
                            }
                          };
                          req.send();
                        }}
                      />
                    </Tooltip>
                  ) : null}
                </div>
              );
            }}
          ></Column>
        </Table>
      </div>
    );
  };

  const portfolioReportTable = () => {
    return (
      <div className="">
        <div className="flex justify-end ">
          {/* <p className="text-formTitleGreen font-bold text-lg">List of Portfolio reports</p> */}
          <Search
            className="self-end flex w-auto"
            maxLength={20}
            onSearch={(value) => {
              setAllPortfolioScore([]);
              SearchFilter(fullPortfolioScore, value)
                .then((res) => {
                  setAllPortfolioScore(res);
                })
                .catch(() => {
                  setAllPortfolioScore(fullPortfolioScore);
                });
            }}
          />
        </div>
        <Table
          className="titleRow mt-4"
          dataSource={[...allPortfolioScore]}
          // dataSource={[]}
          locale={{
            emptyText: <p className="text-black italic">There are no results that match your search.</p>,
          }}
          // dataSource={reportTemp}
          pagination={{ position: ["bottomLeft"], defaultPageSize: 5, showSizeChanger: true, pageSizeOptions: [5, 10, 20, 50, 100] }}
          scroll={{ x: 800 }}
        >
          <Column title={<p className="text-xs 1000:text-sm">Report Date</p>} dataIndex="name" sorter={(a, b) => a.name.localeCompare(b.name)} showSorterTooltip={false}></Column>
          <Column
            title={<p className="text-xs 1000:text-sm">Environmental</p>}
            sorter={(a, b) => a.Env - b.Env}
            showSorterTooltip={false}
            render={(row) => {
              return (
                <div className="flex items-center text-xs 1000:text-sm">
                  {row.Env + "%"}&emsp;{getESGLevel(row.Env)}
                </div>
              );
            }}
          ></Column>
          <Column
            title={<p className="text-xs 1000:text-sm">Social</p>}
            sorter={(a, b) => a.Soc - b.Soc}
            showSorterTooltip={false}
            render={(row) => {
              return (
                <div className="flex items-center text-xs 1000:text-sm">
                  {row.Soc + "%"}&emsp;{getESGLevel(row.Soc)}
                </div>
              );
            }}
          ></Column>
          <Column
            title={<p className="text-xs 1000:text-sm">Governance</p>}
            sorter={(a, b) => a.Gov - b.Gov}
            showSorterTooltip={false}
            render={(row) => {
              return (
                <div className="flex items-center text-xs 1000:text-sm">
                  {row.Gov + "%"}&emsp;{getESGLevel(row.Gov)}
                </div>
              );
            }}
          ></Column>
          <Column
            title={<p className="text-xs 1000:text-sm">Sustainable Procurement</p>}
            sorter={(a, b) => a.Sus - b.Sus}
            showSorterTooltip={false}
            render={(row) => {
              return (
                <div className="flex items-center text-xs 1000:text-sm">
                  {row.Sus + "%"}&emsp;{getESGLevel(row.Sus)}
                </div>
              );
            }}
          ></Column>
          <Column
            title={<p className="text-xs 1000:text-sm">ESG Portfolio Maturity Level</p>}
            sorter={(a, b) => a.score - b.score}
            showSorterTooltip={false}
            render={(row) => {
              return (
                <div className="flex items-center text-xs 1000:text-sm">
                  {row.score + "%"}&emsp;{getESGLevel(row.score)}
                </div>
              );
            }}
          ></Column>
          <Column
            title=""
            render={(row, record, index) => {
              return (
                <div className="flex gap-x-4 items-center text-xs 1000:text-sm">
                  {index === 0 ? (
                    <Tooltip title="View">
                      <EyeOutlined
                        className="text-view cursor-pointer"
                        onClick={() => {
                          let link = document.createElement("a");
                          link.target = "_blank";
                          link.href = WEBURL + "/esg/portfolioReport?id=" + company.id + "&token=" + sessionStorage.getItem("accessToken");
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }}
                      />
                    </Tooltip>
                  ) : null}
                  <Tooltip title="Download">
                    <DownloadOutlined
                      className="text-share cursor-pointer"
                      onClick={() => {
                        setIsDownload(true);
                        let data = "";
                        data = index !== 0 ? PORTFOLIOREPORTURL + "/esg?target=" + WEBURL + "/esg/portfolioPdf?id=" + company.id + "&year=" + row.year + "&quarter=" + row.quarter + "&accessToken=" + sessionStorage.getItem("accessToken") : PORTFOLIOREPORTURL + "/esg?target=" + WEBURL + "/esg/portfolioPdf?id=" + company.id + "&accessToken=" + sessionStorage.getItem("accessToken");
                        let req = new XMLHttpRequest();
                        req.open("GET", data, true);
                        req.responseType = "blob";
                        req.onload = function () {
                          //Convert the Byte Data to BLOB object.
                          let blob = new Blob([req.response], { type: "application/octetstream" });
                          //Check the Browser type and download the File.
                          let isIE = false || !!document.documentMode;
                          if (isIE) {
                            window.navigator.msSaveBlob(blob, company.companyName + ".pdf");
                            setIsDownload(false);
                          } else {
                            let url = window.URL || window.webkitURL;
                            let link = url.createObjectURL(blob);
                            let a = document.createElement("a");
                            a.setAttribute("download", company.companyName + ".pdf");
                            a.target = "_blank";
                            a.setAttribute("href", link);
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            setIsDownload(false);
                          }
                        };
                        req.send();
                      }}
                    />
                  </Tooltip>
                </div>
              );
            }}
          ></Column>
        </Table>
      </div>
    );
  };

  const connectionModal = () => (
    <Modal visible={newConnectionVisible} footer={null} closable={false} onCancel={() => setNewConnectionVisible(false)} bodyStyle={{ overflowY: "scroll" }} width={1000}>
      <div className="flex justify-end items-center gap-x-2">
        <p className="font-semibold text-xs 1000:text-sm">Search company:</p>
        <Search
          className="self-end flex w-auto Connection-search"
          maxLength={20}
          onSearch={(value) => {
            setFilteredCompany([]);
            SearchFilter(newCompany, value)
              .then((res) => {
                setFilteredCompany(res);
              })
              .catch(() => {
                setFilteredCompany(newCompany);
              });
          }}
        />
      </div>
      <Table
        className="titleRow h-[600px] mt-4"
        dataSource={[...filteredCompany]}
        locale={{
          emptyText: <p className="text-black italic">There are no results that match your search.</p>,
        }}
        pagination={{ showSizeChanger: true, position: ["bottomLeft"], pageSize: 20 }}
        scroll={{ x: 800 }}
      >
        <Column title={<p className="text-xs 1000:text-sm">Company Name</p>} dataIndex="companyName" sorter={(a, b) => a.companyName.localeCompare(b.companyName)} showSorterTooltip={false} render={(row) => <p className="text-xs 1000:text-sm">{row}</p>} />
        <Column title={<p className="text-xs 1000:text-sm">Registration Number</p>} dataIndex="ssmNumber" sorter={(a, b) => a.ssmNumber.localeCompare(b.ssmNumber)} showSorterTooltip={false} render={(row) => <p className="text-xs 1000:text-sm">{row}</p>} />
        <Column title={<p className="text-xs 1000:text-sm">Industry</p>} dataIndex="industry" sorter={(a, b) => a.industry.localeCompare(b.industry)} showSorterTooltip={false} render={(row) => <p className="text-xs 1000:text-sm">{row}</p>} />
        <Column
          title={<p className="text-xs 1000:text-sm">Action</p>}
          render={(row) => (
            <div className="flex gap-x-4 items-center text-xs 1000:text-sm">
              <Tooltip title="Request to connect">
                <UserAddOutlined className="text-share cursor-pointer" onClick={() => requestConnection(row)} />
              </Tooltip>
            </div>
          )}
        />
      </Table>
    </Modal>
  );

  const requestConnection = (value) => {
    Modal.confirm({
      okText: "Confirm",
      cancelText: "Cancel",
      title: "Confirm to connect with " + value.companyName + "?",
      icon: <ExclamationCircleOutlined />,
      onOk() {
        createNewConnection(value);
      },
    });
  };

  

  const showReportContentTab = {
    assestment: assestmentReportTable(),
    connection: corporateReportTable(),
    singleBusiness: singleEntityReportTable(),
    portfolio: portfolioReportTable(),
  };

  const updateConnection = (value, action) => {
    let id = [];
    let shared = [];
    fullCompletedAssessment.map((val) => {
      if (val.sharedWiths !== null) {
        val.sharedWiths = val.sharedWiths.filter((item) => item.corporateID !== value.id);
        id.push(val.id);
        shared.push(val.sharedWiths);
      }
    });

    fullSharedAssessment.map((val) => {
      if (val.smeID === value.id) {
        if (val.sharedWiths !== null) {
          val.sharedWiths = val.sharedWiths.filter((item) => item.corporateID !== company.id);
          id.push(val.id);
          shared.push(val.sharedWiths);
        }
      }
    });

    let data = {
      status: "",
    };
    if (action === "C") {
      data.status = "ACTIVE";
    } else {
      data.status = "INACTIVE";
    }
    APIHelpers.PUT("v1/connection?id=" + value.connectionId, data)
      .then(() => {
        if (action !== "C") {
          if (id.length > 0) {
            id.map((val, index) => {
              let data = {
                sharedWiths: shared[index],
              };
              APIHelpers.PUT("v1/assessment?id=" + val, data)
                .then(() => {
                  if (index === id.length - 1) {
                    getSME();
                    getAllAssessment();
                    message.success({
                      content: "You are no longer connected with " + value.companyName + ".",
                      style: {
                        fontSize: "20px",
                        marginTop: "100px",
                      },
                      duration: 5,
                    });
                  }
                })
                .catch(() => {
                  message.error({
                    content: "You cannot disconnect with " + value.companyName + ".",
                    style: {
                      fontSize: "20px",
                      marginTop: "100px",
                    },
                    duration: 8,
                  });
                });
            });
          } else {
            getSME();
            getAllAssessment();
            message.success({
              content: "You are no longer connected with " + value.companyName + ".",
              style: {
                fontSize: "20px",
                marginTop: "100px",
              },
              duration: 5,
            });
          }
        } else {
          getSME();
          getAllAssessment();
          message.success({
            content: "You are now connected with " + value.companyName + ".",
            style: {
              fontSize: "20px",
              marginTop: "100px",
            },
            duration: 5,
          });
        }
      })
      .catch(() => {});
  };

  const createNewConnection = (value) => {
    let data = {
      requestCompanyID: company.id,
      receivedCompanyID: value.id,
      linkDate: new Date(),
      status: "INVITED",
    };
    APIHelpers.POST("v1/connection", data)
      .then(() => {
        message.success({
          content: "Your request to connect with " + value.companyName + " was successful.",
          style: {
            fontSize: "20px",
            marginTop: "100px",
          },
          duration: 5,
        });
        getSME();
      })
      .catch(() => {
        message.error({
          content: "Your request to connect with " + value.companyName + " was unsuccessful.",
          style: {
            fontSize: "20px",
            marginTop: "100px",
          },
          duration: 8,
        });
      });
  };

  const confirmDisconnect = (value) => {
    Modal.confirm({
      okText: "Confirm",
      cancelText: "Cancel",
      title: "Confirm to disconnect with " + value.companyName + "?",
      icon: <ExclamationCircleOutlined />,
      onOk() {
        updateConnection(value, "D");
      },
    });
  };

  const confirmConnect = (value) => {
    Modal.confirm({
      okText: "Confirm",
      cancelText: "Cancel",
      title: "Confirm to connect with " + value.companyName + "?",
      icon: <ExclamationCircleOutlined />,
      onOk() {
        updateConnection(value, "C");
      },
    });
  };

  const confirmRequest = (value) => {
    Modal.confirm({
      okText: "Confirm",
      cancelText: "Cancel",
      title: "Confirm to request " + value.companyName + " to share report with assessment ID " + value.serialNo + "?",
      icon: <ExclamationCircleOutlined />,
      onOk() {
        requestShare(value);
      },
    });
  };

  const requestShare = (value) => {
    let share = value.sharedWiths;
    let request = [];
    if (share !== null) {
      if (share.filter((item) => item.corporateID === company.id).length === 0) {
        request.push({
          corporateID: company.id,
          linkDate: new Date(),
          status: "INVITED",
        });
      }
    } else {
      request = [
        {
          corporateID: company.id,
          linkDate: new Date(),
          status: "INVITED",
        },
      ];
    }
    let data = {
      sharedWiths: request,
    };
    APIHelpers.PUT("v1/assessment?id=" + value.id, data)
      .then(() => {
        message.success({
          content: "Your request to " + value.companyName + " for sharing their Assessment Report was successful.",
          style: {
            fontSize: "20px",
            marginTop: "100px",
          },
          duration: 5,
        });
      })
      .catch(() => {
        message.error({
          content: "Your request to " + value.companyName + " for sharing their Assessment Report was unsuccessful.",
          style: {
            fontSize: "20px",
            marginTop: "100px",
          },
          duration: 8,
        });
      });
  };

  const shareReport = () => {
    let report = assessment.filter((item) => item.id === reportID)[0];
    return (
      <Modal visible={shareReportModalVisible} className="Modal-rounded-login" closable={false} footer={null} onCancel={() => setShareReportModalVisible(false)} width={700}>
        <div className="bg-darkprimary px-8 py-8 text-white rounded-t-xl">
          <p className="font-bold text-2xl">Share Assessment Report</p>
        </div>
        <div className="px-8 py-8 flex flex-col Share-checkbox">
          {report.sharedWiths.length > 0 ? (
            report.sharedWiths.map((val) => (
              <Checkbox
                defaultChecked={val.status === "ACTIVE" ? true : false}
                onChange={(value) => {
                  if (value.target.checked === true) {
                    if (report.sharedWiths !== null) {
                      if (report.sharedWiths.filter((item) => item.corporateID === val.corporateID).length === 0) {
                        let data = report.sharedWiths;
                        data.push({
                          corporateID: val.corporateID,
                          linkDate: new Date(),
                          status: "ACTIVE",
                        });
                        setSharedWith(data);
                      } else {
                        let data = report.sharedWiths;
                        let index = report.sharedWiths.findIndex((item) => item.corporateID === val.corporateID);
                        data[index] = {
                          corporateID: val.corporateID,
                          linkDate: new Date(),
                          status: "ACTIVE",
                        };
                        setSharedWith(data);
                      }
                    } else {
                      let data = [
                        {
                          corporateID: val.corporateID,
                          linkDate: new Date(),
                          status: "ACTIVE",
                        },
                      ];
                      setSharedWith(data);
                    }
                  } else {
                    if (report.sharedWiths !== null) {
                      if (report.sharedWiths.filter((item) => item.corporateID === val.corporateID).length > 0) {
                        let data = report.sharedWiths;
                        let index = report.sharedWiths.findIndex((item) => item.corporateID === val.corporateID);
                        data[index] = {
                          corporateID: val.corporateID,
                          linkDate: new Date(),
                          status: "INVITED",
                        };
                        setSharedWith(data);
                      }
                    }
                  }
                }}
              >
                {fullCompany.filter((item) => item.id === val.corporateID)[0].companyName}
              </Checkbox>
            ))
          ) : (
            <p className="italic text-xl">No company request to share yet.</p>
          )}
          <div className="mt-4 text-right">
            {report.sharedWiths !== null ? (
              <Button onClick={() => updateShared(reportID)} className="px-8 rounded-lg bg-gradient-to-t from-#DF3B57 to-#DF3B57CC text-white hover:bg-gradient-to-t focus:bg-gradient-to-t hover:text-white focus:text-white">
                SHARE
              </Button>
            ) : null}
          </div>
        </div>
      </Modal>
    );
  };

  const updateShared = (id) => {
    if (sharedWith.length > 0) {
      let data = {
        sharedWiths: sharedWith,
      };
      APIHelpers.PUT("v1/assessment?id=" + id, data)
        .then(() => {
          getAssessment();
          message.success({
            content: "You have successfully updated your Assessment Report " + reportSerialNo + " sharing.",
            style: {
              fontSize: "20px",
              marginTop: "100px",
            },
            duration: 5,
          });
          setReportID("");
          setReportSerialNo("");
          setShareReportModalVisible(false);
        })
        .catch(() => {
          message.error({
            content: "Your Assessment Report " + reportSerialNo + " sharing was not updated.",
            style: {
              fontSize: "20px",
              marginTop: "100px",
            },
            duration: 8,
          });
        });
    } else {
      setReportID("");
      setReportSerialNo("");
      setShareReportModalVisible(false);
    }
  };

  
  const shopMSIC = MSIC.map((row) => {
    return (
      <Option value={row.code}>
        {row.code} - {row.industry}
      </Option>
    );
  });

  
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

  const getESGLevel = (value) => {
    if (value >= 0 && value < 25) {
      return "Beginner";
    } else if (value >= 25 && value < 45) {
      return "Fair";
    } else if (value >= 45 && value < 65) {
      return "Good";
    } else if (value >= 65 && value < 85) {
      return "Progressive";
    } else if (value >= 85 && value <= 100) {
      return "Exceptional";
    }
  };

  const showPending = () => {
    let text = "";
    let width = 600;
    if (pendingShare === true && pendingConnection === false) {
      text = "You have report share request pending.";
    } else if (pendingShare === false && pendingConnection === true) {
      text = "You have company connection request pending.";
    } else if (pendingShare === true && pendingConnection === true) {
      text = "You have company connection request and report share request pending.";
      width = 800;
    }
    return (
      <Modal visible={pendingVisible} className="mt-48" closable={false} footer={null} width={width} onCancel={() => setPendingVisible(false)}>
        <div className="flex justify-center items-center gap-x-2">
          <InfoCircleOutlined className="text-base 1000:text-lg text-orange-500" />
          <p className="font-semibold text-base 1000:text-lg">{text}</p>
        </div>
      </Modal>
    );
  };

  return (
    <Layout className="min-h-full">
      <Header></Header>
      <Content className="bg-white 1150:px-12 px-8 min-h-9/10 w-full pb-16">
      <DashPage></DashPage>

          <Col className="w-full 1150:w-12/12">
            <Row className="flex justify-end items-center ">
            </Row>
            <Row className="rounded-lg">
              <p className="text-formTitleGreen font-bold text-sm 1000:text-base" style={{color: 'purple'}}>{activeReportTable === "assestment" ? "List of my completed assessment reports" : activeReportTable === "connection" ? " List of companies that is currently connected" : activeReportTable === "singleBusiness" ? "List of shared assessment reports" : "List of portfolio reports"}</p>
              <Card
                style={{ width: "100%" }}
                tabList={reportTabList}
                activeTabKey={activeReportTable}
                className="dashboardCard rounded-xl mt-4 border-t-0 shadow-md"
                onTabChange={(key) => {
                  changeReportTab(key);
                }}
              >
                {
                  showReportContentTab[activeReportTable]
                }
              </Card>
            </Row>
            <Row className="mt-8 rounded-lg">
           
              {reportID !== "" ? shareReport() : null}
              {showDownload()}
              {showPending()}
              {connectionModal()}
            </Row>
          </Col>
      </Content>
      <Footer />
      
    </Layout>
  );
}

export default HomePage;
