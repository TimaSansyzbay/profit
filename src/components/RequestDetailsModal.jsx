import { Descriptions, Image, Modal, Space, Typography } from "antd";

export default function RequestDetailsModal({ open, onClose, record }) {
  return (
    <Modal
      open={open}
      onCancel={onClose}
      onOk={onClose}
      okText="Закрыть"
      cancelButtonProps={{ style: { display: "none" } }}
      title={record ? `Обращение #${record.id}` : "Обращение"}
      width={720}
    >
      {!record ? (
        <Typography.Text type="secondary">Нет данных</Typography.Text>
      ) : (
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
          <Descriptions bordered size="small" column={1}>
            <Descriptions.Item label="ID">{record.id}</Descriptions.Item>
            <Descriptions.Item label="Категория">{record.category}</Descriptions.Item>
            <Descriptions.Item label="Адрес">{record.address}</Descriptions.Item>
            <Descriptions.Item label="Статус">{record.status}</Descriptions.Item>
            <Descriptions.Item label="Дата регистрации">{record.created_at}</Descriptions.Item>
            <Descriptions.Item label="Описание">{record.description}</Descriptions.Item>
            <Descriptions.Item label="Координаты">
              {typeof record.latitude === "number" && typeof record.longitude === "number"
                ? `${record.latitude}, ${record.longitude}`
                : "—"}
            </Descriptions.Item>
          </Descriptions>

          {record.photo ? (
            <div>
              <Typography.Title level={5} style={{ marginTop: 0 }}>
                Фото
              </Typography.Title>
              <Image src={record.photo} alt={`Фото обращения #${record.id}`} style={{ maxWidth: "100%" }} />
            </div>
          ) : null}
        </Space>
      )}
    </Modal>
  );
}
