import {
  Box,
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
} from "@chakra-ui/react";
import { FaEdit } from "react-icons/fa";
import {
  collection,
  doc,
  getDoc,
  runTransaction,
  updateDoc,
} from "firebase/firestore";
import { NextPage } from "next";
import React, { useEffect, useState } from "react";
import { useSetRecoilState } from "recoil";
import { db } from "../../../firebase";
import { loadingState } from "../../../store";
import { CuttingReportType } from "../../../types/CuttingReportType";
import CuttingReportInputArea from "./CuttingReportInputArea";

type Props = {
  // report: CuttingReportType;
  reportId: string;
};

const EditCuttingReportModal: NextPage<Props> = ({ reportId }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const setLoading = useSetRecoilState(loadingState);
  const [report, setReport] = useState({} as CuttingReportType);
  const [items, setItems] = useState({
    staff: "",
    processNumber: "",
    itemName: "",
    itemType: "",
    client: "",
    totalQuantity: 0,
    comment: "",
    products: [{ category: "", productId: "", quantity: 0 }],
  } as CuttingReportType);

  useEffect(() => {
    const getCuttingReport = async () => {
      const docRef = doc(db, "cuttingReports", reportId);
      const docSnap = await getDoc(docRef);
      setReport({ ...docSnap.data() } as CuttingReportType);
      setItems({ ...docSnap.data() } as CuttingReportType);
    };
    getCuttingReport();
  }, [isOpen, reportId]);

  // 裁断報告書更新
  const updateCuttingReport = async () => {
    const result = window.confirm("更新して宜しいでしょうか");
    if (!result) return;
    setLoading(true);

    const cuttingReportDocRef = doc(db, "cuttingReports", reportId);
    const productsRef = collection(db, "products");
    try {
      runTransaction(db, async (transaction) => {
        transaction.update(cuttingReportDocRef, {
          ...items,
        });
        items.products?.map(async (product, index) => {
          if (!product.productId) return;
          const productDocRef = doc(productsRef, product.productId);
          const productSnap = await getDoc(productDocRef);
          if (!productSnap.exists()) throw "productSnap does not exist!";

          const tokushimaStock = await productSnap.data()?.tokushimaStock || 0;

          const initValue = report?.products[index]?.quantity || 0;

          const newTokushimaStock =
            Number(tokushimaStock) +
            Number(initValue) -
            Number(product.quantity);
          // transaction.update(productDocRef, {
          //   tokushimaStock: Math.round(newTokushimaStock * 100) / 100,
          // });
          await updateDoc(productDocRef, {
            tokushimaStock: Math.round(newTokushimaStock * 100) / 100,
          });
        });


      });
    } catch (err) {
      console.log(err);
      window.alert("登録失敗");
    } finally {
      setLoading(false);
      onClose();
    }
  };

  return (
    <>
      <FaEdit onClick={onOpen} cursor="pointer" />

      <Modal isOpen={isOpen} onClose={onClose} size="3xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>裁断報告書</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <CuttingReportInputArea
              title="裁断報告書編集"
              btnTitle="更新"
              onClick={updateCuttingReport}
              items={items}
              setItems={setItems}
              reportId={reportId}
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" mr={3} onClick={onClose}>
              閉じる
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default EditCuttingReportModal;
