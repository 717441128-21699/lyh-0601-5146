import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Certificate, CertificateType, CertificateLevel } from './entities/certificate.entity';
import { PaginationDto } from '../common/dto/pagination.dto';
import { Registration } from '../registrations/entities/registration.entity';

function generateCertificateNumber(contestId: number, userId: number): string {
  const date = new Date();
  const year = date.getFullYear();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `CERT-${year}-${contestId}-${userId}-${random}`;
}

@Injectable()
export class CertificatesService {
  constructor(
    @InjectRepository(Certificate)
    private certificatesRepository: Repository<Certificate>,
  ) {}

  async create(data: Partial<Certificate>): Promise<Certificate> {
    if (!data.certificateNumber) {
      data.certificateNumber = generateCertificateNumber(data.contestId || 0, data.userId || 0);
    }
    if (!data.issuedAt) {
      data.issuedAt = new Date();
    }
    const certificate = this.certificatesRepository.create(data);
    return this.certificatesRepository.save(certificate);
  }

  async findAll(paginationDto: PaginationDto, filters?: {
    contestId?: number;
    userId?: number;
    type?: CertificateType;
    level?: CertificateLevel;
  }) {
    const { page, pageSize, sortBy, sortOrder } = paginationDto;
    const skip = (page - 1) * pageSize;

    const queryBuilder = this.certificatesRepository.createQueryBuilder('cert');

    if (filters?.contestId) {
      queryBuilder.andWhere('cert.contestId = :contestId', { contestId: filters.contestId });
    }
    if (filters?.userId) {
      queryBuilder.andWhere('cert.userId = :userId', { userId: filters.userId });
    }
    if (filters?.type) {
      queryBuilder.andWhere('cert.type = :type', { type: filters.type });
    }
    if (filters?.level) {
      queryBuilder.andWhere('cert.level = :level', { level: filters.level });
    }

    queryBuilder.skip(skip).take(pageSize);
    queryBuilder.orderBy(sortBy ? `cert.${sortBy}` : 'cert.createdAt', sortOrder || 'DESC');

    const [items, total] = await queryBuilder.getManyAndCount();

    return { items, total, page, pageSize };
  }

  async findOne(id: number): Promise<Certificate> {
    const certificate = await this.certificatesRepository.findOne({ where: { id } });
    if (!certificate) {
      throw new NotFoundException(`证书ID ${id} 不存在`);
    }
    return certificate;
  }

  async findByCertificateNumber(number: string): Promise<Certificate> {
    const certificate = await this.certificatesRepository.findOne({ where: { certificateNumber: number } });
    if (!certificate) {
      throw new NotFoundException(`证书编号 ${number} 不存在`);
    }
    return certificate;
  }

  async findByUser(userId: number, paginationDto: PaginationDto) {
    return this.findAll(paginationDto, { userId });
  }

  async findByContest(contestId: number, paginationDto: PaginationDto) {
    return this.findAll(paginationDto, { contestId });
  }

  async generateTranscript(registration: Registration, contestTitle: string): Promise<Certificate> {
    return this.create({
      contestId: registration.contestId,
      userId: registration.userId,
      type: CertificateType.TRANSCRIPT,
      title: `${contestTitle} - 成绩单`,
      description: `参加${contestTitle}的完整成绩单`,
      finalRank: registration.finalRank,
      finalScore: registration.finalScore,
      solvedCount: registration.solvedCount,
    });
  }

  async generateParticipation(registration: Registration, contestTitle: string): Promise<Certificate> {
    return this.create({
      contestId: registration.contestId,
      userId: registration.userId,
      type: CertificateType.PARTICIPATION,
      title: `${contestTitle} - 参赛证明`,
      description: `成功参加${contestTitle}`,
      finalRank: registration.finalRank,
      finalScore: registration.finalScore,
    });
  }

  async generateAward(
    registration: Registration,
    contestTitle: string,
    level: CertificateLevel,
  ): Promise<Certificate> {
    const levelNames = {
      [CertificateLevel.BRONZE]: '铜奖',
      [CertificateLevel.SILVER]: '银奖',
      [CertificateLevel.GOLD]: '金奖',
      [CertificateLevel.PLATINUM]: '白金奖',
    };

    return this.create({
      contestId: registration.contestId,
      userId: registration.userId,
      type: CertificateType.AWARD,
      level,
      title: `${contestTitle} - ${levelNames[level]}`,
      description: `在${contestTitle}中获得${levelNames[level]}`,
      finalRank: registration.finalRank,
      finalScore: registration.finalScore,
    });
  }

  async markDownloaded(id: number): Promise<Certificate> {
    const certificate = await this.findOne(id);
    certificate.isDownloaded = true;
    return this.certificatesRepository.save(certificate);
  }

  async verify(number: string): Promise<{ valid: boolean; certificate?: Certificate }> {
    try {
      const certificate = await this.findByCertificateNumber(number);
      return { valid: true, certificate };
    } catch {
      return { valid: false };
    }
  }
}
