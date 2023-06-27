import dynamic from "next/dynamic";
import { PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, LabelList, Tooltip } from "recharts";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });
const CategoryList = ["Water Consumption", "Environmental Management", "Ecosystems Approach", "Carbon Footprint (GHG Emissions)", "Inclusivity", "Wages", "Anti Corruption Policies", "Climate Governance"];
const defaultFont = "Caudex, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, Noto Sans, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol, Noto Color Emoji";
const reportFont = "Caudex, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, Noto Sans, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol, Noto Color Emoji";

export const reportOverallBarChart = (value, width, font) => {
  let label = ["Environmental", "Social", "Governance", "Overall"];
  let series = [
    {
      name: "Maturity Level",
      data: value,
    },
  ];
  let options = {
    chart: {
      type: "bar",
      height: 300,
      toolbar: {
        show: false,
      },
    },
    title: {
      text: "ESG Score by Dimension",
      align: "center",
      style: {
        color: "#0E6896",
        fontFamily: font === true ? reportFont : defaultFont,
        fontWeight: "700",
        fontSize: width > 600 ? "20px" : "16px",
      },
    },
    colors: [
      function ({ value, seriesIndex, w }) {
        if (value >= 0 && value < 25) {
          return "#FA0202";
        } else if (value >= 25 && value < 50) {
          return "#F97316";
        } else if (value >= 50 && value < 75) {
          return "#FFCA42";
        } else if (value >= 75 && value <= 100) {
          return "#367D16";
        }
      },
    ],
    plotOptions: {
      bar: {
        dataLabels: {
          position: "top",
        },
        barHeight: "90%",
      },
    },
    dataLabels: {
      enabled: true,
      offsetY: -30,
      style: {
        fontSize: "16px",
        fontWeight: 400,
        fontFamily: font === true ? reportFont : defaultFont,
        colors: ["#000"],
      },
      formatter: function (val) {
        return parseInt(val) + "%";
      },
    },
    stroke: {
      show: true,
      width: 1,
      colors: ["#fff"],
    },
    tooltip: {
      enabled: false,
      shared: false,
      intersect: false,
    },
    xaxis: {
      categories: label,
      labels: {
        style: {
          fontSize: "16px",
          fontFamily: font === true ? reportFont : defaultFont,
          fontWeight: 400,
        },
        formatter: function (val) {
          return val;
        },
      },
      axisBorder: {
        show: false,
      },
    },
    yaxis: {
      show: false,
      min: 0,
      max: 105,
    },
    legend: {
      show: false,
    },
    grid: {
      yaxis: {
        lines: {
          show: false,
        },
      },
      xaxis: {
        lines: {
          show: false,
        },
      },
    },
  };
  return <Chart options={options} series={series} type="bar" height={300} width={width} className="flex justify-center" />;
};

export const reportColumnChart = (value, other, width, font) => {
  let label = [];
  let self = [];
  let others = [];
  Object.keys(value).map((val) => {
    if (val !== "score") {
      Object.keys(value[val]).map((val2) => {
        if (val2 !== "score") {
          Object.keys(value[val][val2]).map((val3) => {
            if (val3 !== "score") {
              label[CategoryList.indexOf(val3)] = val3;
              self[CategoryList.indexOf(val3)] = value[val][val2][val3].score;
              others[CategoryList.indexOf(val3)] = other[val][val3];
            }
          });
        }
      });
    }
  });
  let series = [
    {
      name: "sme",
      data: self,
    },
    {
      name: "other",
      data: others,
    },
  ];
  let options = {
    chart: {
      type: "bar",
      height: 300,
      toolbar: {
        show: false,
      },
    },
    colors: ["#1F5180", "#FFCA42"],
    plotOptions: {
      bar: {
        horizontal: true,
        dataLabels: {
          position: "top",
        },
        barHeight: "90%",
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 1,
      colors: ["#fff"],
    },
    tooltip: {
      enabled: false,
      shared: false,
      intersect: false,
    },
    xaxis: {
      categories: label,
      labels: {
        style: {
          fontFamily: font === true ? reportFont : defaultFont,
        },
        formatter: function (val) {
          return parseInt(val) + "%";
        },
      },
      min: 0,
      max: 100,
      axisBorder: {
        show: false,
      },
    },
    yaxis: {
      show: true,
      labels: {
        maxWidth: 240,
        style: {
          fontSize: "12px",
          fontWeight: "600",
          fontFamily: font === true ? reportFont : defaultFont,
        },
      },
      min: 0,
      max: 100,
    },
    legend: {
      show: false,
    },
    grid: {
      yaxis: {
        lines: {
          show: false,
        },
      },
      xaxis: {
        lines: {
          show: false,
        },
      },
    },
  };
  return <Chart options={options} series={series} type="bar" height={350} width={width} />;
};

export const portfolioReportOverallBarChart = (value, width, font) => {
  let label = ["Environmental", "Social", "Governance", "Overall"];
  let series = [
    {
      name: "Maturity Level",
      data: value,
    },
  ];
  let options = {
    chart: {
      type: "bar",
      height: 300,
      toolbar: {
        show: false,
      },
    },
    title: {
      text: "Portfolio ESG Score by Dimension",
      align: "center",
      style: {
        color: "#0E6896",
        fontFamily: font === true ? reportFont : defaultFont,
        fontWeight: "700",
        fontSize: width > 600 ? "20px" : "16px",
      },
    },
    colors: [
      function ({ value, seriesIndex, w }) {
        if (value >= 0 && value < 25) {
          return "#FA0202";
        } else if (value >= 25 && value < 50) {
          return "#F97316";
        } else if (value >= 50 && value < 75) {
          return "#FFCA42";
        } else if (value >= 75 && value <= 100) {
          return "#367D16";
        }
      },
    ],
    plotOptions: {
      bar: {
        dataLabels: {
          position: "top",
        },
        barHeight: "90%",
      },
    },
    dataLabels: {
      enabled: true,
      offsetY: -30,
      style: {
        fontSize: "16px",
        fontWeight: 400,
        fontFamily: font === true ? reportFont : defaultFont,
        colors: ["#000"],
      },
      formatter: function (val) {
        return parseInt(val) + "%";
      },
    },
    stroke: {
      show: true,
      width: 1,
      colors: ["#fff"],
    },
    tooltip: {
      enabled: false,
      shared: false,
      intersect: false,
    },
    xaxis: {
      categories: label,
      labels: {
        style: {
          fontSize: "15px",
          fontFamily: font === true ? reportFont : defaultFont,
          fontWeight: 400,
        },
        formatter: function (val) {
          return val;
        },
      },
      axisBorder: {
        show: false,
      },
    },
    yaxis: {
      show: false,
      min: 0,
      max: 105,
    },
    legend: {
      show: false,
    },
    grid: {
      yaxis: {
        lines: {
          show: false,
        },
      },
      xaxis: {
        lines: {
          show: false,
        },
      },
    },
  };
  return <Chart options={options} series={series} type="bar" height={300} width={width} className="flex justify-center" />;
};

export const portfolioPieChart = (value, width) => {
  let inner = 0;
  let outer = 0;
  if (width > 1500) {
    width = width * 0.15;
    inner = width * 0.15;
    outer = width * 0.3;
  } else {
    width = width * 0.18;
    inner = width * 0.15;
    outer = width * 0.25;
  }
  let series = [];
  value.map((val, index) => {
    series.push({
      name: "Group " + index,
      value: val,
    });
  });
  let COLORS = ["#FA0202", "#F97316", "#FFCA42", "#367D16"];
  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 1.25;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return percent > 0 ? (
      <text x={x} y={y} fontSize={12} fill="black" textAnchor={x > cx ? "start" : "end"} dominantBaseline="central">
        {`${series[index].value} (${(percent * 100).toFixed(0)}%)`}
      </text>
    ) : null;
  };

  return (
    <PieChart width={width} height={250}>
      <Pie data={series} dataKey="value" cx="50%" cy="50%" labelLine={false} startAngle={0} innerRadius={inner} outerRadius={outer} label={renderCustomizedLabel}>
        {series.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
        ))}
      </Pie>
    </PieChart>
  );
};

export const portfolioColumnChart = (value, length, title, width, font) => {
  let height = 450;
  let barHeight = "20px";
  if (Object.keys(value).length > 10 && Object.keys(value).length <= 16) {
    barHeight = "70px";
  } else if (Object.keys(value).length > 5 && Object.keys(value).length <= 10) {
    barHeight = "40px";
  } else if (Object.keys(value).length > 2 && Object.keys(value).length <= 5) {
    barHeight = "30px";
  }
  let label = [];
  let data = [];
  let percent = [];
  let max = 0;
  Object.keys(value).map((val) => {
    if (max === 0 || value[val] > max) {
      max = value[val];
    }
    if (value[val] !== 0) {
      percent.push(Math.round((value[val] / length) * 100));
    } else {
      percent.push(0);
    }
    label.push(val);
    data.push(value[val]);
  });
  max = Math.ceil((max + 1) / 5) * 5;
  let series = [
    {
      name: "sme",
      data: data,
    },
  ];
  let options = {
    chart: {
      type: "bar",
      toolbar: {
        show: false,
      },
    },
    title: {
      text: "No. of SMEs by " + title,
      align: "center",
      style: {
        fontSize: width > 1100 ? "20px" : "16px",
        color: "#0E6896",
        fontFamily: font === true ? reportFont : defaultFont,
        fontWeight: "700",
      },
    },
    colors: ["#1F5180"],
    plotOptions: {
      bar: {
        horizontal: true,
        dataLabels: {
          position: "top",
        },
        barHeight: barHeight,
      },
    },
    dataLabels: {
      enabled: true,
      offsetX: 40,
      style: {
        fontFamily: font === true ? reportFont : defaultFont,
        colors: ["#0E6896"],
      },
      formatter: function (val, index) {
        return parseInt(val) + " (" + percent[index.dataPointIndex] + "%)";
      },
    },
    tooltip: {
      enabled: false,
      shared: false,
      intersect: false,
    },
    xaxis: {
      categories: label,
      tickAmount: 5,
      max: max,
      labels: {
        showDuplicates: false,
        style: {
          fontFamily: font === true ? reportFont : defaultFont,
        },
        formatter: function (val, index) {
          return parseInt(val);
        },
      },
      axisBorder: {
        show: false,
      },
    },
    yaxis: {
      show: true,
      labels: {
        minWidth: 150,
        maxWidth: 300,
        style: {
          fontSize: "13px",
          fontWeight: "600",
          fontFamily: font === true ? reportFont : defaultFont,
        },
      },
    },
    legend: {
      show: false,
    },
    grid: {
      yaxis: {
        lines: {
          show: false,
        },
      },
      xaxis: {
        lines: {
          show: true,
        },
      },
    },
  };
  return <Chart options={options} series={series} type="bar" height={height} width={width} />;
};

export const portfolioDonutChart = (value, width) => {
  let height = width > 500 ? 380 : 330;
  let radius = width > 500 ? 150 : 120;
  let series = value;
  let COLORS = ["#002266", "#0044cc", "#3377ff", "#6699ff", "#b3ccff"];
  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 1.1;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return percent > 0 ? (
      <text x={x} y={y} fill="black" textAnchor={x > cx ? "start" : "end"} dominantBaseline="central">
        {`${series[index].value} (${(percent * 100).toFixed(0)}%)`}
      </text>
    ) : null;
  };

  return (
    <PieChart width={width} height={height}>
      <Pie data={series} dataKey="value" cx="50%" cy="50%" labelLine={false} startAngle={0} outerRadius={radius} label={renderCustomizedLabel}>
        {series.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
        ))}
      </Pie>
    </PieChart>
  );
};

export const homePageColumnChart = (width, font) => {
  let series = [
    {
      name: "Environment",
      data: [0, 0, 1.5, 0, 0, 1.5, 1.5, 1, 1.5, 0, 1.5, 1, 1.5, 3, 3, 0, 0],
    },
    {
      name: "Social",
      data: [3, 3, 1.5, 1.5, 1.5, 1.5, 1.5, 1, 1.5, 1.5, 1.5, 1, 0, 0, 0, 1.5, 0],
    },
    {
      name: "Governance",
      data: [0, 0, 0, 1.5, 1.5, 0, 0, 1, 0, 1.5, 0, 1, 1.5, 0, 0, 1.5, 3],
    },
  ];
  let labelWidth = 350;
  let fontSize = "16px";
  if (width < 700) {
    labelWidth = 250;
    fontSize = "12px";
  }
  let options = {
    chart: {
      type: "bar",
      height: 300,
      toolbar: {
        show: false,
      },
      stacked: true,
    },
    colors: ["#97B316", "#FF950E", "#449DB1"],
    plotOptions: {
      bar: {
        horizontal: true,
        dataLabels: {
          position: "top",
        },
        // barHeight: "70%",
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      // width: 1,
      colors: ["#fff"],
    },
    tooltip: {
      enabled: false,
      shared: false,
      intersect: false,
    },
    xaxis: {
      categories: [
        "1. End Poverty",
        "2. Zero Hunger",
        "3. Good Health and Well-Being",
        "4. Quality Education",
        "5. Gender Equality",
        "6. Clean Water and Sanitation",
        "7. Affordable and Clean Energy",
        "8. Decent Work and Economic Growth",
        "9. Industry, Innovation, and Infrastructure",
        "10. Reduced Inequalities",
        "11. Sustainable Cities and Communities",
        "12. Responsible Consumption and Production",
        "13. Climate Action",
        "14. Life Below Water",
        "15. Life on Land",
        "16. Peace, Justice, and Strong Institutions",
        "17. Partnerships for the Goals",
      ],
      labels: {
        // style: {
        //   fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, Noto Sans, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol, Noto Color Emoji",
        // },
        // formatter: function (val) {
        //   return parseInt(val) + "%";
        // },
        colors: "#38273A",
        show: false,
      },
      min: 0,
      max: 3,
      axisBorder: {
        show: false,
      },
    },
    yaxis: {
      show: true,
      labels: {
        minWidth: labelWidth,
        maxWidth: labelWidth,
        style: {
          fontSize: fontSize,
          fontWeight: "600",
          colors: "#38273A",
          fontFamily: font === true ? reportFont : defaultFont,
        },
        offsetY: 3,
      },
      min: 0,
      max: 3,
    },
    legend: {
      position: "top",
      // horizontalAlign: "left",
      // offsetX: 40,
      fontSize: fontSize,
      labels: {
        colors: "#38273A",
      },
      fontFamily: font === true ? reportFont : defaultFont,
      fontWeight: "600",
    },
    grid: {
      yaxis: {
        lines: {
          show: false,
        },
      },
      xaxis: {
        lines: {
          show: false,
        },
      },
    },
    scales: {},
  };
  return <Chart options={options} series={series} type="bar" height={450} width={width} />;
};

export const portfolioDonutChartTemp = (value, width, color) => {
  let height = width > 250 ? 280 : 200;
  let radius = width > 250 ? 100 : 70;
  let series = value;
  let COLORS = color;
  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 1.1;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return percent > 0 ? (
      <text x={x} y={y} fill="black" textAnchor={x > cx ? "start" : "end"} dominantBaseline="central">
        {`${series[index].value} (${(percent * 100).toFixed(0)}%)`}
      </text>
    ) : null;
  };

  return (
    <PieChart width={width} height={height}>
      <Pie data={series} dataKey="value" cx="50%" cy="50%" labelLine={false} startAngle={0} outerRadius={radius} label={renderCustomizedLabel}>
        {series.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
        ))}
      </Pie>
      <Tooltip />
    </PieChart>
  );
};

export const portfolioColumnChartTemp = (value, length, width, font) => {
  let height = 450;
  let barHeight = "20px";
  if (Object.keys(value).length > 10 && Object.keys(value).length <= 16) {
    barHeight = "70px";
  } else if (Object.keys(value).length > 5 && Object.keys(value).length <= 10) {
    barHeight = "40px";
  } else if (Object.keys(value).length > 2 && Object.keys(value).length <= 5) {
    barHeight = "30px";
  }
  let label = [];
  let data = [];
  let percent = [];
  let max = 0;
  Object.keys(value).map((val) => {
    if (max === 0 || value[val] > max) {
      max = value[val];
    }
    if (value[val] !== 0) {
      percent.push(Math.round((value[val] / length) * 100));
    } else {
      percent.push(0);
    }
    label.push(val);
    data.push(value[val]);
  });
  max = Math.ceil((max + 1) / 5) * 5;
  let series = [
    {
      name: "sme",
      data: data,
    },
  ];
  let options = {
    chart: {
      type: "bar",
      toolbar: {
        show: false,
      },
    },
    colors: ["#15803d"],
    plotOptions: {
      bar: {
        horizontal: true,
        dataLabels: {
          position: "top",
        },
        barHeight: barHeight,
      },
    },
    dataLabels: {
      enabled: true,
      offsetX: 40,
      style: {
        fontFamily: font === true ? reportFont : defaultFont,
        colors: ["#15803d"],
      },
      formatter: function (val, index) {
        if (parseInt(val) > 0) return parseInt(val) + " (" + percent[index.dataPointIndex] + "%)";
      },
    },
    tooltip: {
      enabled: false,
      shared: false,
      intersect: false,
    },
    xaxis: {
      show: false,
      categories: label,
      tickAmount: 5,
      max: max,
      labels: {
        show: false,
        showDuplicates: false,
        style: {
          fontFamily: font === true ? reportFont : defaultFont,
        },
        formatter: function (val, index) {
          return parseInt(val);
        },
      },
      axisBorder: {
        show: false,
      },
    },
    yaxis: {
      show: true,
      labels: {
        minWidth: 150,
        maxWidth: 300,
        style: {
          fontSize: "13px",
          fontWeight: "600",
          fontFamily: font === true ? reportFont : defaultFont,
          // colors: ["#15803d"],
        },
      },
    },
    legend: {
      show: false,
    },
    grid: {
      yaxis: {
        lines: {
          show: false,
        },
      },
      xaxis: {
        lines: {
          show: true,
        },
      },
    },
  };
  return <Chart options={options} series={series} type="bar" height={height} width={width} />;
};

export const radarChart = (value, width) => {
  let height = width - 50;
  return (
    <ResponsiveContainer width={width} height={height}>
      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={value}>
        <PolarGrid />
        <PolarAngleAxis dataKey="dimension" />
        <PolarRadiusAxis domain={[0, 100]} />
        <Radar dataKey="B" stroke="#99f6e4" fill="#99f6e4" fillOpacity={0.6}>
          {/* <LabelList dataKey="B" /> */}
        </Radar>
        <Radar dataKey="A" stroke="#facc15" fill="#facc15" fillOpacity={0.6}>
          {/* <LabelList dataKey="A" /> */}
        </Radar>
      </RadarChart>
    </ResponsiveContainer>
  );
};

export const multiRadarChart = (value, width) => {
  let options = {
    chart: {
      height: width,
      type: "radar",
      dropShadow: {
        enabled: true,
        blur: 1,
        left: 1,
        top: 1,
      },
      toolbar: {
        show: false,
      },
    },
    stroke: {
      width: 2,
      colors: ["#22c55e", "#008080"],
    },
    fill: {
      opacity: 0.1,
      colors: ["#22c55e", "#008080"],
    },
    markers: {
      size: 0,
    },
    colors: ["#22c55e", "#008080"],
    xaxis: {
      labels: {
        style: {
          fontSize: "14px",
          colors: ["#15803d", "#15803d", "#15803d", "#15803d"],
        },
        // offsetX: -5,
      },
      categories: ["Environment", "Governance", "Sustainable Procurement", "Social"],
    },
    yaxis: {
      show: false,
      max: 100,
    },
    dataLabels: {
      enabled: true,
      background: {
        enabled: true,
        borderRadius: 2,
      },
      style: {
        fontSize: "13px",
      },
    },
    legend: {
      show: false,
    },
    plotOptions: {
      radar: {
        size: width > 450 ? 120 : width > 360 ? 90 : 70,
        polygons: {
          strokeColor: "#e8e8e8",
          fill: {
            colors: ["#f8f8f8", "#fff"],
          },
        },
      },
    },
  };
  return <Chart options={options} series={value} type="radar" width={width} />;
};
