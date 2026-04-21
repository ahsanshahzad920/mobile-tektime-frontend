import React, { useState } from "react";
import { Form, Input, Select, Button, Space, Typography, Spin } from "antd";
import { toast } from "react-toastify";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { API_BASE_URL } from "../../../Apicongfig";
import CookieService from '../../../Utils/CookieService';

const { Title, Text } = Typography;
const { Option } = Select;

const AddAccountModal = ({ handleClose, triggerRefresh }) => {
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();

    const onFinish = async (values) => {
        setLoading(true);
        const userId = parseInt(CookieService.get("user_id"), 10);
        
        if (!userId) {
            toast.error("User ID not found");
            setLoading(false);
            return;
        }

        const payload = {
            username: values.username,
            password: values.password,
            host: `imap.ionos.${values.domain}`
        };

        try {
            const res = await fetch(`${API_BASE_URL}/ionos-emails/add-account`, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json", 
                    "Authorization": `Bearer ${CookieService.get("token")}` 
                },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.message || "API error");
            }

            toast.success("Compte ajouté avec succès !");
            handleClose?.();
            triggerRefresh?.();
            form.resetFields();
        } catch (err) {
            toast.error(err.message || "Échec de l'ajout du compte");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-2">
            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                initialValues={{ domain: "com" }}
            >
                <Form.Item
                    label="Domaine Host"
                    name="domain"
                    required
                >
                    <Select>
                        <Option value="com">imap.ionos.com</Option>
                        <Option value="us">imap.ionos.us</Option>
                        <Option value="fr">imap.ionos.fr</Option>
                        <Option value="eu">imap.ionos.eu</Option>
                        <Option value="it">imap.ionos.it</Option>
                        <Option value="es">imap.ionos.es</Option>
                    </Select>
                </Form.Item>

                <Form.Item
                    label="Nom d'utilisateur"
                    name="username"
                    rules={[{ required: true, message: "Veuillez entrer votre nom d'utilisateur" }]}
                >
                    <Input placeholder="email@votre-domaine.com" size="large" />
                </Form.Item>

                <Form.Item
                    label="Mot de passe"
                    name="password"
                    rules={[{ required: true, message: "Veuillez entrer votre mot de passe" }]}
                >
                    <Input.Password placeholder="Votre mot de passe" size="large" />
                </Form.Item>

                <div className="d-flex justify-content-end gap-2 mt-4">
                    <Button onClick={handleClose} disabled={loading}>
                        Annuler
                    </Button>
                    <Button type="primary" htmlType="submit" loading={loading} size="large">
                        {loading ? "Validation..." : "Valider"}
                    </Button>
                </div>
            </Form>
        </div>
    );
};

export default AddAccountModal;
