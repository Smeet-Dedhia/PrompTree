import { Topic, Prompt } from '@/types';

export const SEED_TOPICS: { name: string; prompts: Omit<Prompt, 'id'>[] }[] = [
  {
    name: 'Work',
    prompts: [
      {
        title: 'Enterprise RAG Copilot Experience',
        text: 'I have hands-on experience designing and deploying end-to-end multi-agent AI copilots integrated into complex legacy Java-based enterprise applications (such as Windchill) and workflow engines like Appian or ServiceNow. I owned the cloud-native microservice architecture, FastAPI gateway containers, and RAG pipelines grounded on Confluence documents and training videos. My work automated up to 65% of support workflows and internal service tickets for a user base of 1,000+ engineers, while strictly adhering to enterprise IT governance and data compliance policies.',
        tags: ['work', 'rag', 'agentic-ai', 'enterprise'],
        isStarred: true,
        createdAt: Date.now() - 4000
      },
      {
        title: 'GPU & Edge Optimization Experience',
        text: 'I specialize in edge computer vision deployment and high-performance computing (HPC) optimization. I have compiled and optimized deep learning models (such as YOLO) for resource-constrained edge platforms including NVIDIA Jetson Nano and Raspberry Pi. Using C++, TensorRT, ONNX, and NVIDIA NSight systems profiling, I doubled edge model throughput from 5 FPS to 12 FPS. Additionally, I optimized cloud-based GPU inference servers using SLA-aware routing, dynamic batching, mixed precision, and multi-threaded worker pools to increase concurrent serving capacity by 4x.',
        tags: ['work', 'gpu', 'performance', 'c++'],
        isStarred: false,
        createdAt: Date.now() - 3000
      },
      {
        title: 'NL-to-SQL (Sequel2SQL Capstone)',
        text: 'For a capstone project sponsored by Microsoft, I architected and built a command-line developer tool called Sequel2SQL to optimize natural language to SQL translation. Using the Pydantic AI framework, I built an agentic orchestration layer that utilizes AST parsing of SQL queries to dynamically inject validation guidelines. The system grounds LLM requests with embeddings from short-term memory (summarized conversation histories) and long-term memory (curated few-shot SQL examples), improving baseline accuracy by 6% on the BIRD CRITIC benchmark.',
        tags: ['work', 'sql', 'pydantic-ai', 'rag'],
        isStarred: false,
        createdAt: Date.now() - 2000
      },
      {
        title: 'MLOps & Data Pipelines',
        text: 'I have built scalable cloud-native ELT pipelines following the Medallion architecture (Bronze, Silver, Gold tables) in AWS and Azure. I engineered automated preprocessing and feature engineering pipelines in PySpark and Azure Databricks to migrate a predictive Customer Churn model, reducing manual operational effort by 80% and tracking the lifecycle using MLflow. To reduce overhead, I developed BeautifulSoup scrapers to collect open-source data as alternatives to expensive paid APIs, generating $1,500 in annual data cost savings.',
        tags: ['work', 'mlops', 'pyspark', 'databricks'],
        isStarred: false,
        createdAt: Date.now() - 1000
      }
    ]
  },
  {
    name: 'University',
    prompts: [
      {
        title: 'Embodied AI & Robotic Control',
        text: 'My academic work at the University of Washington focused heavily on robotics and embodied AI systems. I developed systems for robot state estimation using Extended Kalman Filter SLAM (EKF-SLAM), path planning with RRT/RRT*, and reinforcement learning. In addition, I successfully implemented and fine-tuned Vision-Language-Action (VLA) models on teleoperated demonstration datasets to achieve real-time, closed-loop trajectory control of a 6-DOF robotic manipulator.',
        tags: ['academic', 'robotics', 'vla', 'embodied-ai'],
        isStarred: true,
        createdAt: Date.now() - 8000
      },
      {
        title: 'Autonomous Drone Software (ROS)',
        text: 'I served as the Software and AI Head for an autonomous drone (UAV) project at university, managing a cross-functional team of 40 students and building an AI division from scratch. I designed and deployed lightweight computer vision object detection models onto onboard computing devices like Raspberry Pi, integrating the inference pipeline directly into the Robot Operating System (ROS) environment and establishing autonomous navigation and search-and-rescue algorithms.',
        tags: ['academic', 'drones', 'ros', 'computer-vision'],
        isStarred: false,
        createdAt: Date.now() - 7000
      },
      {
        title: 'Neuroscience EEG Signal Processing',
        text: 'During my academic study, I completed advanced coursework in machine learning for neuroscience and built analysis pipelines for brain EEG data. I wrote Python scripts to ingest raw EEG data, perform bandpass and notch filtering, and apply Independent Component Analysis (ICA) for blink and motion artifact rejection. I then developed deep learning classifiers (such as EEGNet) to classify motor imagery tasks from the processed neural signals.',
        tags: ['academic', 'neuroscience', 'eeg', 'ml-pipelines'],
        isStarred: false,
        createdAt: Date.now() - 6000
      },
      {
        title: 'Scientific Literature Synthesis',
        text: 'I am trained in scientific literature analysis and research synthesis. My approach to reading machine learning and robotics publications involves systematically extracting: (1) the core scientific hypothesis, (2) the underlying mathematical formulations (e.g. loss functions, reward structures), (3) baseline comparisons and sample efficiency claims, and (4) structural or assumptions-based limitations in empirical setups. This allows me to replicate complex architectures and identify extension opportunities.',
        tags: ['academic', 'research', 'writing'],
        isStarred: false,
        createdAt: Date.now() - 5000
      }
    ]
  },
  {
    name: 'Hobbies',
    prompts: [
      {
        title: 'Home Lab & NAS Infrastructure',
        text: 'I manage a custom self-hosted home laboratory and network setup. My infrastructure includes a Network Attached Storage (NAS) array, a home media and compute server, and containerized local services (such as Home Assistant and Ollama for running local LLMs) managed via Docker. I have configured custom routing algorithms and network layouts to optimize local transfer speeds, establish secure remote access, and run scheduled encrypted backup pipelines.',
        tags: ['hobby', 'homelab', 'nas', 'networking'],
        isStarred: true,
        createdAt: Date.now() - 11000
      },
      {
        title: 'Early-Stage Startup Experience',
        text: 'I have been actively involved as a technical advisor and leader at four diverse, early-stage startups. These ventures spanned drone-based search and rescue, AI-enabled health tracking, events aggregation, and a creative learning platform teaching art to young creators. I translated advanced technical concepts in software and AI into clear business value, helped design initial product MVPs, and formulated strategic go-to-market (GTM) plans and pitch slides for fundraising.',
        tags: ['hobby', 'startup', 'business-development'],
        isStarred: false,
        createdAt: Date.now() - 10000
      },
      {
        title: 'Hackathons & Team Leadership',
        text: 'I have a strong track record of technical leadership and team collaboration. I have won three hackathons, managed a student robotics organization at university, and regularly coordinate cross-functional teams including product managers and domain experts. I employ a structured communication style, setting up user-testing loops early, aligning deliverables with business goals, and translating user feedback into actionable engineering milestones.',
        tags: ['hobby', 'leadership', 'hackathons'],
        isStarred: false,
        createdAt: Date.now() - 9000
      }
    ]
  }
];
