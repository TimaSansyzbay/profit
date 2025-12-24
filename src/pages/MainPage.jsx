import {
    Button,
    Card,
    Col,
    Divider,
    Layout,
    Row,
    Select,
    Space,
    Statistic,
    Table,
    Tag,
    Typography,
    Input,
} from "antd";
import { useMemo, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import data from "../assets/data.json";
import RequestDetailsModal from "../components/RequestDetailsModal";

const statusToTagColor = (value) => {
    switch (value) {
        case "В работе":
            return "processing";
        case "Решено":
            return "success";
        case "Отклонено":
            return "error";
        default:
            return "default";
    }
};

const columns = [
    {
        title: "ID",
        dataIndex: "id",
        key: "id",
    },
    {
        title: "Категория",
        dataIndex: "category",
        key: "category",
    },
    {
        title: "Адрес",
        dataIndex: "address",
        key: "address",
    },
    {
        title: "Статус",
        dataIndex: "status",
        key: "status",
        render: (value) => <Tag color={statusToTagColor(value)}>{value}</Tag>,
    },
    {
        title: "Дата регистрации",
        dataIndex: "created_at",
        key: "created_at",
    }
]

export default function MainPage() {
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [query, setQuery] = useState("");
    const [status, setStatus] = useState(undefined);

    const openDetails = (record) => {
        setSelectedRecord(record);
        setDetailsOpen(true);
    };

    const filteredData = useMemo(() => {
        const q = query.trim().toLowerCase();
        return data.filter((item) => {
            const matchesStatus = !status || item.status === status;
            if (!q) return matchesStatus;

            const haystack = [item.address, item.status]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            return matchesStatus && haystack.includes(q);
        });
    }, [query, status]);

    const mapCenter = useMemo(() => {
        const items = filteredData.filter(
            (item) => typeof item.latitude === "number" && typeof item.longitude === "number"
        );
        if (items.length === 0) return [53.2205, 63.6283];

        const avgLat = items.reduce((sum, i) => sum + i.latitude, 0) / items.length;
        const avgLng = items.reduce((sum, i) => sum + i.longitude, 0) / items.length;
        return [avgLat, avgLng];
    }, [filteredData]);

    const stats = useMemo(() => {
        const counts = { total: data.length, inProgress: 0, resolved: 0, rejected: 0 };
        for (const item of data) {
            if (item.status === "В работе") counts.inProgress += 1;
            if (item.status === "Решено") counts.resolved += 1;
            if (item.status === "Отклонено") counts.rejected += 1;
        }
        return counts;
    }, []);

    const mapKey = useMemo(() => `${mapCenter[0]}:${mapCenter[1]}:${filteredData.length}`, [mapCenter, filteredData.length]);

    const { Title, Text } = Typography;

    return (
        <Layout style={{ minHeight: "100vh", background: "#f5f5f5" }}>
            <Layout.Content style={{ width: "100%", maxWidth: 1200, margin: "0 auto", padding: 24 }}>
                <Space direction="vertical" size={16} style={{ width: "100%" }}>
                    <div>
                        <Title level={2} style={{ marginBottom: 0 }}>
                            Обращения жителей
                        </Title>
                        <Text type="secondary">Temirlan Sansyzbay</Text>
                    </div>

                    <Card>
                        <Row gutter={[16, 16]}>
                            <Col xs={24} md={12} lg={6}>
                                <Statistic title="Всего" value={stats.total} />
                            </Col>
                            <Col xs={24} md={12} lg={6}>
                                <Statistic title="В работе" value={stats.inProgress} />
                            </Col>
                            <Col xs={24} md={12} lg={6}>
                                <Statistic title="Решено" value={stats.resolved} />
                            </Col>
                            <Col xs={24} md={12} lg={6}>
                                <Statistic title="Отклонено" value={stats.rejected} />
                            </Col>
                        </Row>

                        <Divider style={{ margin: "16px 0" }} />

                        <Row gutter={[12, 12]} align="middle" justify="space-between">
                            <Col xs={24} md={14} lg={12}>
                                <Input.Search
                                    placeholder="Поиск по статусу и адресу"
                                    allowClear
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                />
                            </Col>
                            <Col xs={24} md={10} lg={6}>
                                <Select
                                    placeholder="Статус"
                                    allowClear
                                    value={status}
                                    onChange={(v) => setStatus(v)}
                                    style={{ width: "100%" }}
                                    options={[
                                        { value: "В работе", label: "В работе" },
                                        { value: "Решено", label: "Решено" },
                                        { value: "Отклонено", label: "Отклонено" },
                                    ]}
                                />
                            </Col>
                            <Col xs={24} lg={6} style={{ textAlign: "right" }}>
                                <Text type="secondary">
                                    Показано: {filteredData.length} / {data.length}
                                </Text>
                            </Col>
                        </Row>
                    </Card>

                    <Card title="Список обращений" bodyStyle={{ padding: 0 }}>
                        <Table
                            rowKey="id"
                            columns={columns}
                            dataSource={filteredData}
                            pagination={{ pageSize: 8 }}
                            onRow={(record) => ({
                                onClick: () => openDetails(record),
                                style: { cursor: "pointer" },
                            })}
                        />
                    </Card>

                    <Card title="Карта обращений">
                        <div style={{ width: "100%", height: 420, borderRadius: 12, overflow: "hidden" }}>
                            <MapContainer
                                key={mapKey}
                                center={mapCenter}
                                zoom={13}
                                style={{ width: "100%", height: "100%" }}
                            >
                                <TileLayer
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />

                                {filteredData
                                    .filter(
                                        (item) =>
                                            typeof item.latitude === "number" && typeof item.longitude === "number"
                                    )
                                    .map((item) => (
                                        <Marker key={item.id} position={[item.latitude, item.longitude]}>
                                            <Popup>
                                                <div style={{ minWidth: 240 }}>
                                                    <div>
                                                        <b>ID:</b> {item.id}
                                                    </div>
                                                    <div>
                                                        <b>Категория:</b> {item.category}
                                                    </div>
                                                    <div>
                                                        <b>Статус:</b> <Tag color={statusToTagColor(item.status)}>{item.status}</Tag>
                                                    </div>
                                                    <div>
                                                        <b>Адрес:</b> {item.address}
                                                    </div>
                                                    <div style={{ marginTop: 8 }}>
                                                        <Button type="link" style={{ padding: 0 }} onClick={() => openDetails(item)}>
                                                            Подробнее
                                                        </Button>
                                                    </div>
                                                </div>
                                            </Popup>
                                        </Marker>
                                    ))}
                            </MapContainer>
                        </div>
                    </Card>
                </Space>

                <RequestDetailsModal
                    open={detailsOpen}
                    onClose={() => setDetailsOpen(false)}
                    record={selectedRecord}
                />
            </Layout.Content>
        </Layout>
    )
}
