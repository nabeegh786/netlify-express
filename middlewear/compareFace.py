
# pip install deepface
from deepface import DeepFace

# pip install opencv-python
#import cv2
import sys

import matplotlib.pyplot as plt


# CNIC = cv2.imread(str(sys.argv[1]))
# IMG = cv2.imread(str(sys.argv[2]))
CNIC = plt.imread(str(sys.argv[1]))
IMG = plt.imread(str(sys.argv[2]))


verification = DeepFace.verify(CNIC, IMG)

ver = verification["verified"]

print(ver)
